const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/helpers');
const config = require('../config/config');

const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new AppError('No token provided', 401);
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { authenticate };