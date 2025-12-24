const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
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
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userRepository.create({ name, email, password: hashedPassword });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);

    // Save refresh token
    await userRepository.updateRefreshToken(user.id, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async login(credentials) {
    const { email, password } = credentials;

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);

    // Save refresh token
    await userRepository.updateRefreshToken(user.id, refreshToken);

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
    const user = await userRepository.findByRefreshToken(refreshToken);
    if (!user || user.id !== decoded.id) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = this.generateTokens(decoded.id);

    // Update refresh token
    await userRepository.updateRefreshToken(decoded.id, tokens.refreshToken);

    return tokens;
  }
}

module.exports = new AuthService();
