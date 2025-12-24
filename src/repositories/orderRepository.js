const db = require('../config/database');

class OrderRepository {
  async create(orderData) {
    const { user_id, total_amount, status = 'pending' } = orderData;
    const [result] = await db.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [user_id, total_amount, status]
    );
    return result.insertId;
  }

  async createOrderItem(orderItemData) {
    const { order_id, product_id, quantity, price } = orderItemData;
    await db.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [order_id, product_id, quantity, price]
    );
  }

  async findById(orderId, userId) {
    const [orders] = await db.query(
      `SELECT o.*, u.name as user_name, u.email as user_email,
         JSON_ARRAYAGG(
           JSON_OBJECT(
             'product_id', oi.product_id,
             'product_name', p.name,
             'quantity', oi.quantity,
             'price', oi.price
           )
         ) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = ? AND o.user_id = ?
       GROUP BY o.id`,
      [orderId, userId]
    );
    return orders[0] || null;
  }

  async findAll(filters) {
    const { user_id, status, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;
    let whereClauses = ['o.user_id = ?'];
    let params = [user_id];

    if (status) {
      whereClauses.push('o.status = ?');
      params.push(status);
    }

    const whereClause = 'WHERE ' + whereClauses.join(' AND ');

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM orders o ${whereClause}`, params);
    const total = countResult[0].total;

    const [orders] = await db.query(
      `SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at, o.updated_at,
         u.name as user_name, u.email as user_email,
         JSON_ARRAYAGG(
           JSON_OBJECT(
             'product_id', oi.product_id,
             'product_name', p.name,
             'quantity', oi.quantity,
             'price', oi.price
           )
         ) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       ${whereClause}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return { orders, total, page: parseInt(page), limit: parseInt(limit) };
  }
}

module.exports = new OrderRepository();
