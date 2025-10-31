import { Test, TestingModule } from '@nestjs/testing';
import { PlayerPostingController } from '../player-posting.controller';
import { PostingModule } from '../posting.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserWithPlayer } from 'src/common/current-user.decorator';
import { PrismaExceptionFilter } from 'src/common/filters/prisma-exception.filter';
import { validUser } from 'src/user/test/user.test-utils';
import * as request from 'supertest';
import { PlayerPosting } from '@prisma/client';
import { PlayerPostingFactory } from './posting.factory';
import { PlayerPostingResponseDto } from '../dto/posting-response.dto';

describe('PlayerPostingController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let user: UserWithPlayer;
  let posting: PlayerPosting;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PostingModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    const userData = validUser();
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userData);
    token = registerRes.body.accessToken;
    user = registerRes.body.user;

    const postingData = PlayerPostingFactory.valid();
    posting = await prisma.playerPosting.create({
      data: {
        ...postingData,
        playerId: user.playerAccount.id,
      },
    });
  });

  afterEach(async () => {
    await prisma.clearDatabase();
  });

  afterAll(async () => {
    await prisma.clearDatabase();
    await prisma.$disconnect();
  });

  describe('GET /posting/player/', () => {
    it('should return a list of player postings', async () => {
      const res = await request(app.getHttpServer())
        .get('/posting/player/')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const list = res.body as PlayerPostingResponseDto[];
      expect(list).toBeInstanceOf(Array);
      expect(list).toHaveLength(1);
      expect(list[0]).toMatchObject(PlayerPostingFactory.response());
    });
  });

  describe('POST /posting/player/', () => {
    beforeEach(async () => {
      await prisma.playerPosting.deleteMany();
    });

    it('should create a player posting', async () => {
      const postingData = PlayerPostingFactory.valid();
      const res = await request(app.getHttpServer())
        .post('/posting/player/')
        .send(postingData)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const createdPosting = res.body as PlayerPostingResponseDto;
      expect(createdPosting).toMatchObject({
        ...PlayerPostingFactory.response(),
        id: expect.any(Number),
      });
    });

    it('should throw 400 if invalid data is provided', async () => {
      const postingData = PlayerPostingFactory.invalid();
      await request(app.getHttpServer())
        .post('/posting/player/')
        .send(postingData)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      const postings = await prisma.playerPosting.findMany();
      expect(postings).toHaveLength(0);
    });

    it('should throw 401 if user is not authenticated', async () => {
      const postingData = PlayerPostingFactory.valid();
      await request(app.getHttpServer())
        .post('/posting/player/')
        .send(postingData)
        .expect(401);
    });
  });

  describe('PATCH /posting/player/:id', () => {
    it('should update a player posting', async () => {
      const updatedData = {
        ...PlayerPostingFactory.valid(),
        title: 'Updated Title',
      };
      const res = await request(app.getHttpServer())
        .patch(`/posting/player/${posting.id}`)
        .send(updatedData)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const updated = res.body as PlayerPostingResponseDto;
      expect(updated).toMatchObject({
        ...PlayerPostingFactory.response(),
        title: 'Updated Title',
      });
    });

    it('should throw 404 if posting does not exist', async () => {
      const updatedData = PlayerPostingFactory.valid();
      await request(app.getHttpServer())
        .patch(`/posting/player/${posting.id + 999}`)
        .send(updatedData)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should throw 403 if user is not the posting owner', async () => {
      const userData = validUser();
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...userData, email: 'other@example.com' });
      const otherToken = registerRes.body.accessToken;

      const updatedData = PlayerPostingFactory.valid();
      await request(app.getHttpServer())
        .patch(`/posting/player/${posting.id}`)
        .send(updatedData)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('DELETE /posting/player/:id', () => {
    it('should delete a player posting', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/posting/player/${posting.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const deleted = res.body as PlayerPostingResponseDto;
      expect(deleted.id).toBe(posting.id);

      const postingInDb = await prisma.playerPosting.findUnique({
        where: { id: posting.id },
      });
      expect(postingInDb).toBeNull();
    });

    it('should throw 404 if posting does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/posting/player/${posting.id + 999}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should throw 403 if user is not the posting owner', async () => {
      const userData = validUser();
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...userData, email: 'other@example.com' });
      const otherToken = registerRes.body.accessToken;

      await request(app.getHttpServer())
        .delete(`/posting/player/${posting.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      const postingInDb = await prisma.playerPosting.findUnique({
        where: { id: posting.id },
      });
      expect(postingInDb).not.toBeNull();
    });
  });
});
