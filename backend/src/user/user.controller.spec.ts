import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { AuthController } from '../auth/auth.controller';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { validUser } from './user.test-utils';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'super-secret-key',
        }),
      ],
      controllers: [UserController, AuthController],
      providers: [UserService, PrismaService, AuthService, JwtStrategy],
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
    await prisma.clearDatabase?.();
    await prisma.$disconnect();
  });

  describe('/user (PATCH)', () => {
    it('should update the user and return updated user', async () => {
      const userData = validUser();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userData)
        .expect(200);
      const token = loginRes.body.accessToken;

      const updateDto = { email: 'updated@example.com', password: 'newpass' };
      const res = await request(app.getHttpServer())
        .patch('/user')
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto)
        .expect(200);

      expect(res.body.email).toBe(updateDto.email);
      expect(res.body.id).toBeDefined();
    });

    it('should return 401 if not authenticated', async () => {
      const updateDto = { email: 'updated@example.com', password: 'newpass' };
      await request(app.getHttpServer())
        .patch('/user')
        .send(updateDto)
        .expect(401);
    });
  });
});
