const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authMiddleware');
const { createOrderValidation } = require('../middlewares/validation');

router.post('/', authenticate, createOrderValidation, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.patch('/:id/cancel', authenticate, orderController.cancelOrder);
router.patch('/:id/pay', authenticate, orderController.markAsPaid);
router.patch('/:id/complete', authenticate, orderController.markAsCompleted);

module.exports = router;