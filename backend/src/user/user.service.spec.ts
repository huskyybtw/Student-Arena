import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { validUser, createValidUser } from './user.test-utils';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;
  let createdUser: { id: number; email: string; password: string };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    createdUser = await createValidUser(prisma);
  });

  afterAll(async () => {
    await prisma.clearDatabase();
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create a user with valid data', async () => {
      const userData = validUser();
      userData.email = Date.now() + '@example.com'; // ensure unique email
      const user = await service.create(userData);
      expect(user.password).not.toBe(userData.password);
      const isMatch = await bcrypt.compare(userData.password, user.password);
      expect(isMatch).toBe(true);
      expect(user).toEqual(
        expect.objectContaining({
          email: userData.email,
          password: expect.any(String),
          id: expect.any(Number),
        }),
      );
    });

    it('should throw if email is missing', async () => {
      const userData = validUser();
      const { email, ...userDataWithoutEmail } = userData;
      await expect(
        service.create(userDataWithoutEmail as any),
      ).rejects.toThrow();
    });

    it('should throw on duplicate email', async () => {
      const userData = validUser();
      userData.email = createdUser.email;
      await expect(service.create(userData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = await service.findAll();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      expect(users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: createdUser.email,
            password: expect.any(String),
            id: createdUser.id,
          }),
        ]),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = await service.findOne(createdUser.id);
      expect(user).not.toBeNull();
      expect(user).toEqual(
        expect.objectContaining({
          email: createdUser.email,
          password: expect.any(String),
          id: createdUser.id,
        }),
      );
    });

    it('should return null if user does not exist', async () => {
      const user = await service.findOne(99999);
      expect(user).toBeNull();
    });
  });

  describe('findUnique', () => {
    it('should return a user by unique email', async () => {
      const user = await service.findUnique({ email: createdUser.email });
      expect(user).not.toBeNull();
      expect(user).toEqual(
        expect.objectContaining({
          email: createdUser.email,
          password: expect.any(String),
          id: createdUser.id,
        }),
      );
    });

    it('should return a user by unique id', async () => {
      const user = await service.findUnique({ id: createdUser.id });
      expect(user).not.toBeNull();
      expect(user).toEqual(
        expect.objectContaining({
          email: createdUser.email,
          password: expect.any(String),
          id: createdUser.id,
        }),
      );
    });

    it('should return null if user does not exist', async () => {
      const user = await service.findUnique({ email: 'notfound@example.com' });
      expect(user).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user with valid data', async () => {
      const updated = await service.update(createdUser.id, {
        email: 'updated@example.com',
      });
      expect(updated).toEqual(
        expect.objectContaining({
          email: 'updated@example.com',
          password: expect.any(String),
          id: createdUser.id,
        }),
      );
    });

    it('should update the password and hash it properly', async () => {
      const newPassword = 'newpassword123';
      const updated = await service.update(createdUser.id, {
        password: newPassword,
      });
      expect(updated.password).not.toBe(newPassword);
      const isMatch = await bcrypt.compare(newPassword, updated.password);
      expect(isMatch).toBe(true);
    });

    it('should throw if user does not exist', async () => {
      await expect(
        service.update(99999, { email: 'fail@example.com' }),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete a user by id', async () => {
      const deleted = await service.remove(createdUser.id);
      expect(deleted).toEqual(
        expect.objectContaining({
          email: createdUser.email,
          password: expect.any(String),
          id: createdUser.id,
        }),
      );
      const user = await service.findOne(createdUser.id);
      expect(user).toBeNull();
    });

    it('should throw if user does not exist', async () => {
      await expect(service.remove(99999)).rejects.toThrow();
    });
  });
});
