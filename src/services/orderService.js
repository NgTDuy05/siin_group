const db = require('../config/database');
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');

class OrderService {
  async createOrder(userId, items) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      let totalAmount = 0;
      const orderItems = [];

      // Validate products and calculate total
      for (const item of items) {
        const product = await productRepository.findById(item.product_id);
        
        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product_id: product.id,
          quantity: item.quantity,
          price: product.price
        });

        // Update stock
        await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, product.id]
        );
      }

      // Create order
      const orderId = await orderRepository.create({ user_id: userId, total_amount: totalAmount });

      // Insert order items
      for (const item of orderItems) {
        await orderRepository.createOrderItem({ ...item, order_id: orderId });
      }

      await connection.commit();

      // Fetch complete order
      return await orderRepository.findById(orderId, userId);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
}

module.exports = new OrderService();
