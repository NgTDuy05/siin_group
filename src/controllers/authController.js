const authService = require('../services/authService');
const { AppError, catchAsync } = require('../utils/helpers');

exports.register = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    const result = await authService.register({ name, email, password });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.json({
        success: true,
        message: 'Login successful',
        data: result
    });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError('Refresh token required', 400);
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
        success: true,
        data: result
    });
});