const authService = require('../../services/authService');
const userRepository = require('../../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../repositories/userRepository');
jest.mock('bcryptjs');
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

      userRepository.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      userRepository.create.mockResolvedValue({ id: 1, name: 'Test User', email: 'test@example.com' });
      jwt.sign.mockReturnValue('mockToken');
      userRepository.updateRefreshToken.mockResolvedValue();

      const result = await authService.register(userData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mockToken');
    });

    it('should throw error if email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await expect(authService.register({ email: 'test@example.com' }))
        .rejects
        .toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const credentials = { email: 'test@example.com', password: '123456' };
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword', name: 'Test' };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const result = await authService.login(credentials);

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mockToken');
    });

    it('should throw error with invalid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects
        .toThrow('Invalid credentials');
    });
  });
});
