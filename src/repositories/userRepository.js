const { User } = require('../models');

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({
      where: { email },
      attributes: { include: ['password'] }
    });
  }

  async findById(id) {
    return await User.findByPk(id);
  }

  async create(userData) {
    const { name, email, password } = userData;
    const user = await User.create({ name, email, password });
    return { id: user.id, name: user.name, email: user.email };
  }

  async updateRefreshToken(userId, refreshToken) {
    await User.update(
      { refresh_token: refreshToken },
      { where: { id: userId } }
    );
  }

  async findByRefreshToken(refreshToken) {
    return await User.findOne({
      where: { refresh_token: refreshToken }
    });
  }
}

module.exports = new UserRepository();
