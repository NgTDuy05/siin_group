const db = require('../config/database');

const up = async () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      INDEX idx_order (order_id)
    )
  `;
    await db.query(sql);
    console.log('✓ Order items table created');
};

const down = async () => {
    await db.query('DROP TABLE IF EXISTS order_items');
    console.log('✓ Order items table dropped');
};

module.exports = { up, down };