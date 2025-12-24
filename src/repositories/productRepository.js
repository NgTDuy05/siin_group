const db = require('../config/database');

class ProductRepository {
  async findAll(filters) {
    const { page = 1, limit = 10, search = '', category_id, minPrice, maxPrice, sortBy = 'created_at', sortOrder = 'DESC' } = filters;
    
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];

    if (search) {
      whereClauses.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category_id) {
      whereClauses.push('p.category_id = ?');
      params.push(category_id);
    }
    if (minPrice) {
      whereClauses.push('p.price >= ?');
      params.push(minPrice);
    }
    if (maxPrice) {
      whereClauses.push('p.price <= ?');
      params.push(maxPrice);
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const allowedSortFields = ['name', 'price', 'created_at', 'stock'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM products p ${whereClause}`, params);
    const total = countResult[0].total;

    const [products] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       ${whereClause}
       ORDER BY p.${sortField} ${order}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    return { products, total, page: parseInt(page), limit: parseInt(limit) };
  }

  async findById(id) {
    const [products] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [id]
    );
    return products[0] || null;
  }

  async create(productData) {
    const { name, description, price, stock, category_id, image } = productData;
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, stock, category_id, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock || 0, category_id, image]
    );
    return await this.findById(result.insertId);
  }

  async update(id, productData) {
    const updateFields = [];
    const params = [];

    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        params.push(productData[key]);
      }
    });

    if (updateFields.length === 0) return null;

    params.push(id);
    await db.query(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`, params);
    return await this.findById(id);
  }

  async delete(id) {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
  }
}

module.exports = new ProductRepository();
