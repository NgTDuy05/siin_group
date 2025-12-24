const authService = require('../services/authService');
const { catchAsync } = require('../utils/helpers');

exports.register = catchAsync(async (req, res, next) => {
  const result = await authService.register(req.body);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const result = await authService.login(req.body);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);
  
  res.json({
    success: true,
    data: tokens
  });
});
