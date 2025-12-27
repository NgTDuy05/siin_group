const { Category, Product } = require('../models');
const { Op } = require('sequelize');

class CategoryRepository {
    async create(categoryData) {
        return await Category.create(categoryData);
    }

    async findById(id) {
        return await Category.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'name', 'price', 'stock']
                }
            ]
        });
    }

    async findAll(filters) {
        const { search, page = 1, limit = 10 } = filters;
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        const total = await Category.count({ where });

        const categories = await Category.findAll({
            where,
            include: [
                {
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'name', 'price']
                }
            ],
            order: [['name', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return { categories, total, page: parseInt(page), limit: parseInt(limit) };
    }

    async update(id, updateData) {
        const [updated] = await Category.update(updateData, {
            where: { id }
        });

        return updated;
    }

    async delete(id) {
        return await Category.destroy({
            where: { id }
        });
    }
}

module.exports = new CategoryRepository();
