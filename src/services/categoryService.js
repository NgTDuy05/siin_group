const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
    async createCategory(categoryData) {
        const { name, description } = categoryData;

        // Validate name uniqueness
        const existingCategory = await categoryRepository.findAll({ search: name });
        const exactMatch = existingCategory.categories.find(c => c.name.toLowerCase() === name.toLowerCase());

        if (exactMatch) {
            throw new Error('Category name already exists');
        }

        const category = await categoryRepository.create({ name, description });
        return category;
    }

    async getAllCategories(filters) {
        const result = await categoryRepository.findAll(filters);
        return {
            categories: result.categories,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: Math.ceil(result.total / result.limit)
            }
        };
    }

    async getCategoryById(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    }

    async updateCategory(id, updateData) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }

        // Check name uniqueness if name is being updated
        if (updateData.name && updateData.name !== category.name) {
            const existingCategory = await categoryRepository.findAll({ search: updateData.name });
            const exactMatch = existingCategory.categories.find(c => c.name.toLowerCase() === updateData.name.toLowerCase() && c.id !== id);

            if (exactMatch) {
                throw new Error('Category name already exists');
            }
        }

        const updated = await categoryRepository.update(id, updateData);
        if (updated === 0) {
            throw new Error('Failed to update category');
        }

        return await categoryRepository.findById(id);
    }

    async deleteCategory(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }

        // Check if category has products
        if (category.products && category.products.length > 0) {
            throw new Error('Cannot delete category with existing products. Please reassign or delete products first.');
        }

        const deleted = await categoryRepository.delete(id);
        if (deleted === 0) {
            throw new Error('Failed to delete category');
        }

        return true;
    }
}

module.exports = new CategoryService();
