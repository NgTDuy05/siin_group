const db = require('../config/database');

const up = async () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      stock INT DEFAULT 0,
      image VARCHAR(255),
      category_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      INDEX idx_category (category_id),
      INDEX idx_price (price)
    )
  `;
    await db.query(sql);
    console.log('✓ Products table created');
};

const down = async () => {
    await db.query('DROP TABLE IF EXISTS products');
    console.log('✓ Products table dropped');
};

module.exports = { up, down };