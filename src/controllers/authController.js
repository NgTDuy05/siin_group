const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const config = require('../config/config');
const { AppError, catchAsync } = require('../utils/helpers');

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, config.jwt.secret, {
        expiresIn: config.jwt.expire
    });

    const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpire
    });

    return { accessToken, refreshToken };
};

exports.register = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Check if user exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
        throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
    );

    const { accessToken, refreshToken } = generateTokens(result.insertId);

    // Save refresh token
    await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, result.insertId]);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: { id: result.insertId, name, email },
            accessToken,
            refreshToken
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
        throw new AppError('Invalid credentials', 401);
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token
    await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: { id: user.id, name: user.name, email: user.email },
            accessToken,
            refreshToken
        }
    });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError('Refresh token required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    // Check if token exists in database
    const [users] = await db.query('SELECT * FROM users WHERE id = ? AND refresh_token = ?',
        [decoded.id, refreshToken]);

    if (users.length === 0) {
        throw new AppError('Invalid refresh token', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);

    // Update refresh token
    await db.query('UPDATE users SET refresh_token = ? WHERE id = ?', [newRefreshToken, decoded.id]);

    res.json({
        success: true,
        data: {
            accessToken,
            refreshToken: newRefreshToken
        }
    });
});