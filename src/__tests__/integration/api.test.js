const request = require('supertest');
const app = require('../../app');

describe('API Integration Tests', () => {
  let authToken;
  let testUserId;

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integration Test User',
          email: `test${Date.now()}@example.com`,
          password: '123456'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 409 for duplicate email', async () => {
      const email = `duplicate${Date.now()}@example.com`;
      
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email, password: '123456' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test2', email, password: '123456' });

      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const email = `login${Date.now()}@example.com`;
      
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email, password: '123456' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: '123456' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      
      authToken = res.body.data.accessToken;
    });
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('products');
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('should filter products by search', async () => {
      const res = await request(app).get('/api/products?search=laptop');

      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /api/products', () => {
    it('should create product with auth', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          stock: 10,
          category_id: 1
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('Test Product');
    });

    it('should return 401 without auth', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Test' });

      expect(res.statusCode).toBe(401);
    });
  });
});
