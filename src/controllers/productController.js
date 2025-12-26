const productService = require('../services/productService');
const { AppError, catchAsync } = require('../utils/helpers');

exports.getAllProducts = catchAsync(async (req, res) => {
    const filters = req.query;
    const result = await productService.getAllProducts(filters);

    // Format products with category_name
    const formattedProducts = result.products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        image: p.image,
        category_id: p.category_id,
        category_name: p.category ? p.category.name : null,
        created_at: p.created_at,
        updated_at: p.updated_at
    }));

    res.json({
        success: true,
        data: {
            products: formattedProducts,
            pagination: result.pagination
        }
    });
});

exports.getProductById = catchAsync(async (req, res, next) => {
    const product = await productService.getProductById(req.params.id);

    const formattedProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        category_id: product.category_id,
        category_name: product.category ? product.category.name : null,
        created_at: product.created_at,
        updated_at: product.updated_at
    };

    res.json({
        success: true,
        data: formattedProduct
    });
});

exports.createProduct = catchAsync(async (req, res) => {
    const { name, description, price, stock, category_id } = req.body;
    const image = req.file ? req.file.filename : null;

    const product = await productService.createProduct({
        name,
        description,
        price,
        stock,
        category_id,
        image
    });

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
    });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, price, stock, category_id } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (req.file) updateData.image = req.file.filename;

    if (Object.keys(updateData).length === 0) {
        throw new AppError('No fields to update', 400);
    }

    const product = await productService.updateProduct(id, updateData);

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
    });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    await productService.deleteProduct(id);

    res.json({
        success: true,
        message: 'Product deleted successfully'
    });
});