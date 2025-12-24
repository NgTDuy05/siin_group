const productRepository = require('../repositories/productRepository');
const fs = require('fs');
const path = require('path');

class ProductService {
  async getAllProducts(filters) {
    const result = await productRepository.findAll(filters);
    return {
      products: result.products,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit)
      }
    };
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(productData) {
    return await productRepository.create(productData);
  }

  async updateProduct(id, productData) {
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Delete old image if new image uploaded
    if (productData.image && existingProduct.image) {
      const oldImagePath = path.join('uploads', existingProduct.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    return await productRepository.update(id, productData);
  }

  async deleteProduct(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Delete image file
    if (product.image) {
      const imagePath = path.join('uploads', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await productRepository.delete(id);
  }
}

module.exports = new ProductService();
