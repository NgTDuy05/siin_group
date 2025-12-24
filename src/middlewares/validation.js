const { body, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Auth validations
const registerValidation = [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    validate
];

const loginValidation = [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

// Product validations
const createProductValidation = [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category_id').isInt().withMessage('Category ID must be an integer'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    validate
];

const updateProductValidation = [
    body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category_id').optional().isInt().withMessage('Category ID must be an integer'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    validate
];

// Order validations
const createOrderValidation = [
    body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
    body('items.*.product_id').isInt().withMessage('Product ID must be an integer'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validate
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    createProductValidation,
    updateProductValidation,
    createOrderValidation
};