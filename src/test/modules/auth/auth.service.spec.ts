import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../../modules/users/users.service';
import { AuthService } from '../../../modules/auth/auth.service';
describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            comparePasswords: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mockedAccessToken'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.spyOn(jwtService, 'sign');
  });

  describe('login', () => {
    it('should return accessToken and refreshToken when credentials are valid', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'password',
      };

      // ✅ Ensure findByEmail returns a valid user
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      // ✅ Ensure comparePasswords returns true (password is correct)
      (usersService.comparePasswords as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: mockUser.email,
        password: 'plaintextPassword',
      });

      expect(result).toHaveProperty('accessToken', 'mockedAccessToken');
      expect(result).toHaveProperty('refreshToken', 'mockedAccessToken');
    });
  });

  describe('refreshToken', () => {
    it('should return new accessToken and refreshToken if token is valid', async () => {
      const mockPayload = { sub: 1, email: 'test@example.com' };
      const mockUser = {
        email: 'test@example.com',
        password: 'password',
      };

      // ✅ Ensure `verify` returns a valid payload
      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);

      // ✅ Ensure `findByEmail` returns a user (fixes UnauthorizedException)
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.refreshToken('refresh_token');

      expect(result).toHaveProperty('accessToken', 'mockedAccessToken');
      expect(result).toHaveProperty('refreshToken', 'mockedAccessToken');
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        authService.refreshToken('invalidRefreshToken'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const mockPayload = { sub: 1, email: 'nonexistent@example.com' };

      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.refreshToken('validRefreshToken'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
