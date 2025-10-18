import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth.module';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { createValidUser, validUser } from 'src/user/test/user.test-utils';
import { PlayerTestFactory } from 'src/player/test/player.factory';

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
        playerAccount: PlayerTestFactory.preCreated(),
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
        playerAccount: PlayerTestFactory.preCreated(),
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
