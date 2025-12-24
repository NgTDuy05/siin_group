const db = require('../config/database');

const up = async () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
    await db.query(sql);
    console.log('✓ Categories table created');
};

const down = async () => {
    await db.query('DROP TABLE IF EXISTS categories');
    console.log('✓ Categories table dropped');
};

module.exports = { up, down };