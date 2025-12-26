const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/config');

class AuthService {
  generateTokens(userId) {
    const accessToken = jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expire
    });

    const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpire
    });

    return { accessToken, refreshToken };
  }

  async register(userData) {
    const { name, email, password } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create user (password auto-hashed by model hook)
    const user = await User.create({ name, email, password });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);

    // Save refresh token
    user.refresh_token = refreshToken;
    await user.save();

    return {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken
    };
  }

  async login(credentials) {
    const { email, password } = credentials;

    // Find user (include password for comparison)
    const user = await User.findOne({
      where: { email },
      attributes: { include: ['password'] }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password using model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);

    // Save refresh token
    user.refresh_token = refreshToken;
    await user.save();

    return {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    // Check if token exists in database
    const user = await User.findOne({
      where: {
        id: decoded.id,
        refresh_token: refreshToken
      }
    });

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = this.generateTokens(decoded.id);

    // Update refresh token
    user.refresh_token = tokens.refreshToken;
    await user.save();

    return tokens;
  }
}

module.exports = new AuthService();
