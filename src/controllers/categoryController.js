const categoryService = require('../services/categoryService');
const { AppError, catchAsync } = require('../utils/helpers');

exports.createCategory = catchAsync(async (req, res) => {
    const { name, description } = req.body;

    const category = await categoryService.createCategory({ name, description });

    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
    });
});

exports.getAllCategories = catchAsync(async (req, res) => {
    const filters = req.query;
    const result = await categoryService.getAllCategories(filters);

    res.json({
        success: true,
        data: {
            categories: result.categories,
            pagination: result.pagination
        }
    });
});

exports.getCategoryById = catchAsync(async (req, res, next) => {
    const category = await categoryService.getCategoryById(req.params.id);

    res.json({
        success: true,
        data: category
    });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
        throw new AppError('No fields to update', 400);
    }

    const category = await categoryService.updateCategory(id, updateData);

    res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
    });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    await categoryService.deleteCategory(id);

    res.json({
        success: true,
        message: 'Category deleted successfully'
    });
});
