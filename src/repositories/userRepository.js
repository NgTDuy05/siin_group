const db = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return users[0] || null;
  }

  async findById(id) {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] || null;
  }

  async create(userData) {
    const { name, email, password } = userData;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return { id: result.insertId, name, email };
  }

  async updateRefreshToken(userId, refreshToken) {
    await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, userId]);
  }

  async findByRefreshToken(refreshToken) {
    const [users] = await db.query('SELECT * FROM users WHERE refresh_token = ?', [refreshToken]);
    return users[0] || null;
  }
}

module.exports = new UserRepository();
