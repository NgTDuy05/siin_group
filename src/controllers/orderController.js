const db = require('../config/database');
const { AppError, catchAsync } = require('../utils/helpers');

exports.createOrder = catchAsync(async (req, res, next) => {
    const { items } = req.body;
    const userId = req.user.id;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let totalAmount = 0;
        const orderItems = [];

        // Validate products and calculate total
        for (const item of items) {
            const [products] = await connection.query(
                'SELECT * FROM products WHERE id = ?',
                [item.product_id]
            );

            if (products.length === 0) {
                throw new AppError(`Product with ID ${item.product_id} not found`, 404);
            }

            const product = products[0];

            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for product: ${product.name}`, 400);
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product_id: product.id,
                quantity: item.quantity,
                price: product.price
            });

            // Update stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, product.id]
            );
        }

        // Create order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
            [userId, totalAmount, 'pending']
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of orderItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        await connection.commit();

        // Fetch complete order
        const [orders] = await db.query(
            `SELECT o.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'product_id', oi.product_id,
            'product_name', p.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = ?
       GROUP BY o.id`,
            [orderId]
        );

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: orders[0]
        });

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
});

exports.getOrders = catchAsync(async (req, res) => {
    const { user_id, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    let params = [];

    // Filter by user (admin can see all, users see only their orders)
    if (user_id) {
        whereClauses.push('o.user_id = ?');
        params.push(user_id);
    } else {
        // Regular users see only their orders
        whereClauses.push('o.user_id = ?');
        params.push(req.user.id);
    }

    // Filter by status
    if (status) {
        whereClauses.push('o.status = ?');
        params.push(status);
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Get total count
    const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
        params
    );
    const total = countResult[0].total;

    // Get orders with items
    const [orders] = await db.query(
        `SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at, o.updated_at,
       u.name as user_name, u.email as user_email,
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'product_id', oi.product_id,
           'product_name', p.name,
           'quantity', oi.quantity,
           'price', oi.price
         )
       ) as items
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.id
     ${whereClause}
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
        success: true,
        data: {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
    const [orders] = await db.query(
        `SELECT o.*, u.name as user_name, u.email as user_email,
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'product_id', oi.product_id,
           'product_name', p.name,
           'quantity', oi.quantity,
           'price', oi.price
         )
       ) as items
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE o.id = ? AND o.user_id = ?
     GROUP BY o.id`,
        [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
        throw new AppError('Order not found', 404);
    }

    res.json({
        success: true,
        data: orders[0]
    });
});