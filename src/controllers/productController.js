const db = require('../config/database');
const { AppError, catchAsync } = require('../utils/helpers');
const fs = require('fs');
const path = require('path');

exports.getAllProducts = catchAsync(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        category_id,
        minPrice,
        maxPrice,
        sortBy = 'created_at',
        sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClauses = [];
    let params = [];

    // Search
    if (search) {
        whereClauses.push('(p.name LIKE ? OR p.description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }

    // Filter by category
    if (category_id) {
        whereClauses.push('p.category_id = ?');
        params.push(category_id);
    }

    // Filter by price range
    if (minPrice) {
        whereClauses.push('p.price >= ?');
        params.push(minPrice);
    }
    if (maxPrice) {
        whereClauses.push('p.price <= ?');
        params.push(maxPrice);
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Allowed sort fields
    const allowedSortFields = ['name', 'price', 'created_at', 'stock'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM products p ${whereClause}`,
        params
    );
    const total = countResult[0].total;

    // Get products
    const [products] = await db.query(
        `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     ${whereClause}
     ORDER BY p.${sortField} ${order}
     LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
        success: true,
        data: {
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    });
});

exports.getProductById = catchAsync(async (req, res, next) => {
    const [products] = await db.query(
        `SELECT p.*, c.name as category_name 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.id = ?`,
        [req.params.id]
    );

    if (products.length === 0) {
        throw new AppError('Product not found', 404);
    }

    res.json({
        success: true,
        data: products[0]
    });
});

exports.createProduct = catchAsync(async (req, res) => {
    const { name, description, price, stock, category_id } = req.body;
    const image = req.file ? req.file.filename : null;

    const [result] = await db.query(
        'INSERT INTO products (name, description, price, stock, category_id, image) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, stock || 0, category_id, image]
    );

    const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct[0]
    });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, price, stock, category_id } = req.body;

    // Check if product exists
    const [existingProducts] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existingProducts.length === 0) {
        throw new AppError('Product not found', 404);
    }

    const updateFields = [];
    const params = [];

    if (name !== undefined) {
        updateFields.push('name = ?');
        params.push(name);
    }
    if (description !== undefined) {
        updateFields.push('description = ?');
        params.push(description);
    }
    if (price !== undefined) {
        updateFields.push('price = ?');
        params.push(price);
    }
    if (stock !== undefined) {
        updateFields.push('stock = ?');
        params.push(stock);
    }
    if (category_id !== undefined) {
        updateFields.push('category_id = ?');
        params.push(category_id);
    }
    if (req.file) {
        updateFields.push('image = ?');
        params.push(req.file.filename);

        // Delete old image
        if (existingProducts[0].image) {
            const oldImagePath = path.join('uploads', existingProducts[0].image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
    }

    if (updateFields.length === 0) {
        throw new AppError('No fields to update', 400);
    }

    params.push(id);

    await db.query(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
        params
    );

    const [updatedProduct] = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct[0]
    });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
        throw new AppError('Product not found', 404);
    }

    // Delete image file
    if (products[0].image) {
        const imagePath = path.join('uploads', products[0].image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    await db.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({
        success: true,
        message: 'Product deleted successfully'
    });
});