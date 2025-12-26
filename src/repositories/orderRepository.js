const { Order, OrderItem, Product, User } = require('../models');

class OrderRepository {
  async create(orderData) {
    const { user_id, total_amount, status = 'pending' } = orderData;
    const order = await Order.create({
      user_id,
      total_amount,
      status
    });
    return order.id;
  }

  async createOrderItem(orderItemData) {
    const { order_id, product_id, quantity, price } = orderItemData;
    await OrderItem.create({
      order_id,
      product_id,
      quantity,
      price
    });
  }

  async findById(orderId, userId) {
    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: userId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ]
    });
    return order;
  }

  async findAll(filters) {
    const { user_id, status, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const where = { user_id };
    if (status) {
      where.status = status;
    }

    const total = await Order.count({ where });

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return { orders, total, page: parseInt(page), limit: parseInt(limit) };
  }
}

module.exports = new OrderRepository();
