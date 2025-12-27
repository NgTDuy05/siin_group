const { sequelize, Order, OrderItem, Product, User } = require('../models');
const orderRepository = require('../repositories/orderRepository');

class OrderService {
  async createOrder(userId, items) {
    // Use Sequelize transaction
    const result = await sequelize.transaction(async (transaction) => {
      let totalAmount = 0;
      const orderItems = [];

      // Validate products and calculate total
      for (const item of items) {
        const product = await Product.findByPk(item.product_id, { transaction });

        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        const itemTotal = parseFloat(product.price) * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product_id: product.id,
          quantity: item.quantity,
          price: product.price
        });

        // Update stock using Sequelize
        product.stock -= item.quantity;
        await product.save({ transaction });
      }

      // Create order
      const order = await Order.create(
        {
          user_id: userId,
          total_amount: totalAmount,
          status: 'pending'
        },
        { transaction }
      );

      // Insert order items
      for (const item of orderItems) {
        await OrderItem.create(
          {
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          },
          { transaction }
        );
      }

      return order.id;
    });

    // Fetch complete order
    return await orderRepository.findById(result, userId);
  }

  async getOrders(filters) {
    const result = await orderRepository.findAll(filters);
    return {
      orders: result.orders,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit)
      }
    };
  }

  async getOrderById(orderId, userId) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async cancelOrder(orderId, userId) {
    const order = await orderRepository.findById(orderId, userId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Business rule: Chỉ cho phép hủy nếu đơn hàng đang pending hoặc paid
    if (!['pending', 'paid'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    // Hoàn trả stock nếu cần
    await sequelize.transaction(async (transaction) => {
      for (const item of order.items) {
        const product = await Product.findByPk(item.product_id, { transaction });
        if (product) {
          product.stock += item.quantity;
          await product.save({ transaction });
        }
      }

      await orderRepository.updateStatus(orderId, userId, 'cancelled');
    });

    return await orderRepository.findById(orderId, userId);
  }

  async markAsPaid(orderId, userId) {
    const order = await orderRepository.findById(orderId, userId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Business rule: Chỉ chuyển từ pending sang paid
    if (order.status !== 'pending') {
      throw new Error(`Cannot mark as paid. Current status: ${order.status}`);
    }

    await orderRepository.updateStatus(orderId, userId, 'paid');
    return await orderRepository.findById(orderId, userId);
  }

  async markAsCompleted(orderId, userId) {
    const order = await orderRepository.findById(orderId, userId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Business rule: Phải thanh toán trước khi hoàn thành
    if (order.status !== 'paid') {
      throw new Error(`Cannot complete order. Must be paid first. Current status: ${order.status}`);
    }

    await orderRepository.updateStatus(orderId, userId, 'completed');
    return await orderRepository.findById(orderId, userId);
  }
}

module.exports = new OrderService();
