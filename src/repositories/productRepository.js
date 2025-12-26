const { Product, Category } = require('../models');
const { Op } = require('sequelize');

class ProductRepository {
  async findAll(filters) {
    const { page = 1, limit = 10, search = '', category_id, minPrice, maxPrice, sortBy = 'created_at', sortOrder = 'DESC' } = filters;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    if (category_id) {
      where.category_id = category_id;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    const allowedSortFields = ['name', 'price', 'created_at', 'stock'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const total = await Product.count({ where });

    const products = await Product.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [[sortField, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return { products, total, page: parseInt(page), limit: parseInt(limit) };
  }

  async findById(id) {
    return await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });
  }

  async create(productData) {
    const { name, description, price, stock, category_id, image } = productData;
    const product = await Product.create({
      name,
      description,
      price,
      stock: stock || 0,
      category_id,
      image
    });
    return await this.findById(product.id);
  }

  async update(id, productData) {
    const product = await Product.findByPk(id);
    if (!product) return null;

    await product.update(productData);
    return await this.findById(id);
  }

  async delete(id) {
    const product = await Product.findByPk(id);
    if (product) {
      await product.destroy();
    }
  }
}

module.exports = new ProductRepository();
