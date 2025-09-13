import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { validUser, createValidUser } from '../user/user.test-utils';
import { JwtStrategy } from './strategies/jwt.strategy';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'super-secret-key',
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, UserService, PrismaService, JwtStrategy],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.clearDatabase();
    await prisma.$disconnect();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user and return accessToken and user', async () => {
      const userData = validUser();
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.accessToken).not.toBeNull();
      expect(res.body.accessToken).not.toBeUndefined();
      expect(res.body.user).toEqual({
        id: expect.any(Number),
        email: userData.email,
      });

      // User should exist in DB
      const dbUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(dbUser).not.toBeNull();
    });

    it('should return 409 if user already exists', async () => {
      const userData = validUser();
      await createValidUser(prisma);

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(409);

      expect(res.body.message).toMatch(/email/i);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login an existing user and return accessToken and user', async () => {
      const userData = validUser();
      await request(app.getHttpServer()).post('/auth/register').send(userData);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userData)
        .expect(200);

      expect(res.body.accessToken).not.toBeNull();
      expect(res.body.accessToken).not.toBeUndefined();
      expect(res.body.user).toEqual({
        id: expect.any(Number),
        email: userData.email,
      });
    });

    it('should return 401 if user does not exist', async () => {
      const userData = validUser();
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userData)
        .expect(401);

      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it('should return 401 if password is incorrect', async () => {
      const userData = validUser();
      await request(app.getHttpServer()).post('/auth/register').send(userData);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...userData, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.message).toMatch(/invalid credentials/i);
    });
  });

  describe('/auth/me (GET)', () => {
    it('should return the authenticated user', async () => {
      const userData = validUser();
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      const token = registerRes.body.accessToken;

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toEqual({
        id: expect.any(Number),
        email: userData.email,
      });
    });

    it('should return 401 if no token is provided', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should return 401 if token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });
  });
});
