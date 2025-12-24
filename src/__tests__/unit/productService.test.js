const productService = require('../../services/productService');
const productRepository = require('../../repositories/productRepository');

jest.mock('../../repositories/productRepository');

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should return products with pagination', async () => {
      const mockData = {
        products: [{ id: 1, name: 'Product 1' }],
        total: 1,
        page: 1,
        limit: 10
      };

      productRepository.findAll.mockResolvedValue(mockData);

      const result = await productService.getAllProducts({});

      expect(result.products).toHaveLength(1);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('getProductById', () => {
    it('should return product if exists', async () => {
      productRepository.findById.mockResolvedValue({ id: 1, name: 'Product 1' });

      const result = await productService.getProductById(1);

      expect(result.name).toBe('Product 1');
    });

    it('should throw error if product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(productService.getProductById(999))
        .rejects
        .toThrow('Product not found');
    });
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const productData = { name: 'New Product', price: 99.99 };
      productRepository.create.mockResolvedValue({ id: 1, ...productData });

      const result = await productService.createProduct(productData);

      expect(result.name).toBe('New Product');
      expect(productRepository.create).toHaveBeenCalledWith(productData);
    });
  });
});
