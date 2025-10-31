import { Test, TestingModule } from '@nestjs/testing';
import { TeamPostingController } from '../team-posting.controller';
import { PostingModule } from '../posting.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserWithPlayer } from 'src/common/current-user.decorator';
import { PrismaExceptionFilter } from 'src/common/filters/prisma-exception.filter';
import { validUser } from 'src/user/test/user.test-utils';
import * as request from 'supertest';
import { Team, TeamPosting } from '@prisma/client';
import { TeamTestFactory } from 'src/team/test/team.factory';
import { TeamPostingFactory } from './posting.factory';
import { TeamPostingResponseDto } from '../dto/posting-response.dto';

describe('TeamPostingController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let user: UserWithPlayer;
  let team: Team;
  let posting: TeamPosting;

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

    const teamData = TeamTestFactory.valid();
    team = await prisma.team.create({
      data: {
        ...teamData,
        ownerId: user.playerAccount.id,
        members: { connect: { id: user.playerAccount.id } },
      },
      include: { members: true },
    });

    const postingData = TeamPostingFactory.valid();
    posting = await prisma.teamPosting.create({
      data: {
        ...postingData,
        teamId: team.id,
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

  describe('GET /posting/team/', () => {
    it('should return a list of team postings', async () => {
      const res = await request(app.getHttpServer())
        .get('/posting/team/')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const list = res.body as TeamPostingResponseDto[];
      expect(list).toBeInstanceOf(Array);
      expect(list).toHaveLength(1);
      expect(list[0]).toMatchObject(TeamPostingFactory.response());
    });
  });

  describe('POST /posting/team/', () => {
    beforeEach(async () => {
      await prisma.teamPosting.deleteMany();
    });

    it('should create a team posting', async () => {
      const postingData = TeamPostingFactory.valid();
      const res = await request(app.getHttpServer())
        .post('/posting/team/')
        .send(postingData)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const createdPosting = res.body as TeamPostingResponseDto;
      expect(createdPosting).toMatchObject({
        ...TeamPostingFactory.response(),
        id: expect.any(Number),
      });
    });

    it('should throw 400 if invalid data is provided', async () => {
      const postingData = TeamPostingFactory.invalid();
      await request(app.getHttpServer())
        .post('/posting/team/')
        .send(postingData)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      const postings = await prisma.teamPosting.findMany();
      expect(postings).toHaveLength(0);
    });

    it('should throw 403 if user tries to create posting for team they do not own', async () => {
      const userData2 = validUser();
      const registerRes2 = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...userData2, email: 'other@example.com' });
      const token2 = registerRes2.body.accessToken;

      const postingData = TeamPostingFactory.valid();
      await request(app.getHttpServer())
        .post('/posting/team/')
        .send(postingData)
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);
    });
  });

  describe('PATCH /posting/team/:id', () => {
    it('should update a team posting', async () => {
      const updatedData = {
        ...TeamPostingFactory.valid(),
        title: 'Updated Title',
      };
      const res = await request(app.getHttpServer())
        .patch(`/posting/team/${posting.id}`)
        .send(updatedData)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const updated = res.body as TeamPostingResponseDto;
      expect(updated).toMatchObject({
        ...TeamPostingFactory.response(),
        title: 'Updated Title',
      });
    });

    it('should throw 404 if posting does not exist', async () => {
      const updatedData = TeamPostingFactory.valid();
      await request(app.getHttpServer())
        .patch(`/posting/team/${posting.id + 999}`)
        .send(updatedData)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should throw 403 if user is not the team owner', async () => {
      const userData = validUser();
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...userData, email: 'other@example.com' });
      const otherToken = registerRes.body.accessToken;

      const updatedData = TeamPostingFactory.valid();
      await request(app.getHttpServer())
        .patch(`/posting/team/${posting.id}`)
        .send(updatedData)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('DELETE /posting/team/:id', () => {
    it('should delete a team posting', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/posting/team/${posting.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const deleted = res.body as TeamPostingResponseDto;
      expect(deleted.id).toBe(posting.id);

      const postingInDb = await prisma.teamPosting.findUnique({
        where: { id: posting.id },
      });
      expect(postingInDb).toBeNull();
    });

    it('should throw 404 if posting does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/posting/team/${posting.id + 999}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should throw 403 if user is not the team owner', async () => {
      const userData = validUser();
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...userData, email: 'other@example.com' });
      const otherToken = registerRes.body.accessToken;

      await request(app.getHttpServer())
        .delete(`/posting/team/${posting.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      const postingInDb = await prisma.teamPosting.findUnique({
        where: { id: posting.id },
      });
      expect(postingInDb).not.toBeNull();
    });
  });
});
