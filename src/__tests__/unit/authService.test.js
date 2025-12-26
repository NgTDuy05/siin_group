const authService = require('../../services/authService');
const { User } = require('../../models');
const jwt = require('jsonwebtoken');

jest.mock('../../models');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123456'
      };

      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue()
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockToken');

      const result = await authService.register(userData);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(User.create).toHaveBeenCalled();
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mockToken');
    });

    it('should throw error if email already exists', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await expect(authService.register({ email: 'test@example.com' }))
        .rejects
        .toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const credentials = { email: 'test@example.com', password: '123456' };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue()
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockToken');

      const result = await authService.login(credentials);

      expect(mockUser.comparePassword).toHaveBeenCalledWith('123456');
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mockToken');
    });

    it('should throw error with invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(authService.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects
        .toThrow('Invalid credentials');
    });
  });
});
