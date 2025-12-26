const orderService = require('../services/orderService');
const { AppError, catchAsync } = require('../utils/helpers');

exports.createOrder = catchAsync(async (req, res, next) => {
    const { items } = req.body;
    const userId = req.user.id;

    const order = await orderService.createOrder(userId, items);

    // Format response
    const responseData = {
        id: order.id,
        user_id: order.user_id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        user: {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email
        },
        items: order.items.map(oi => ({
            product_id: oi.product_id,
            product_name: oi.product.name,
            quantity: oi.quantity,
            price: oi.price
        }))
    };

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: responseData
    });
});

exports.getOrders = catchAsync(async (req, res) => {
    const { user_id, status, page = 1, limit = 10 } = req.query;

    const filters = {
        user_id: user_id || req.user.id,
        status,
        page,
        limit
    };

    const result = await orderService.getOrders(filters);

    // Format orders
    const formattedOrders = result.orders.map(order => ({
        id: order.id,
        user_id: order.user_id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        user: {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email
        },
        items: order.items.map(oi => ({
            product_id: oi.product_id,
            product_name: oi.product.name,
            quantity: oi.quantity,
            price: oi.price
        }))
    }));

    res.json({
        success: true,
        data: {
            orders: formattedOrders,
            pagination: result.pagination
        }
    });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await orderService.getOrderById(orderId, userId);

    const responseData = {
        id: order.id,
        user_id: order.user_id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        user: {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email
        },
        items: order.items.map(oi => ({
            product_id: oi.product_id,
            product_name: oi.product.name,
            quantity: oi.quantity,
            price: oi.price
        }))
    };

    res.json({
        success: true,
        data: responseData
    });
});