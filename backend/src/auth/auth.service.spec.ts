import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { validUser, createValidUser } from '../user/user.test-utils';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthModule } from './auth.module';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.clearDatabase();
  });

  afterAll(async () => {
    await prisma.clearDatabase();
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return accessToken and user', async () => {
      const userData = validUser();
      const result = await service.register(userData.email, userData.password);

      expect(result.accessToken).not.toBeNull();
      expect(result.accessToken).not.toBeUndefined();

      expect(result.user).toEqual({
        id: expect.any(Number),
        email: userData.email,
      });

      const dbUser = await userService.findUnique({ email: userData.email });
      expect(dbUser).not.toBeNull();
    });

    it('should throw ConflictException if user already exists', async () => {
      const userData = await createValidUser(prisma);
      await expect(
        service.register(userData.email, userData.password),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login an existing user and return accessToken and user', async () => {
      const userData = validUser();
      await service.register(userData.email, userData.password);
      const result = await service.login(userData.email, userData.password);

      expect(result.accessToken).not.toBeNull();
      expect(result.accessToken).not.toBeUndefined();

      expect(result.user).toEqual({
        id: expect.any(Number),
        email: userData.email,
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const userData = validUser();
      await expect(
        service.login(userData.email, userData.password),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const userData = validUser();
      await service.register(userData.email, userData.password);
      await expect(
        service.login(userData.email, 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
