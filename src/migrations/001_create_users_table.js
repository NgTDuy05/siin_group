const db = require('../config/database');

const up = async () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      refresh_token TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
    await db.query(sql);
    console.log('✓ Users table created');
};

const down = async () => {
    await db.query('DROP TABLE IF EXISTS users');
    console.log('✓ Users table dropped');
};

module.exports = { up, down };