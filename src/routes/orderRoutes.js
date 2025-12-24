const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authMiddleware');
const { createOrderValidation } = require('../middlewares/validation');

router.post('/', authenticate, createOrderValidation, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);

module.exports = router;