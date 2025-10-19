import { Test, TestingModule } from '@nestjs/testing';
import { TeamController } from '../team.controller';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaExceptionFilter } from '../../common/filters/prisma-exception.filter';
import { createValidUser, validUser } from '../../user/test/user.test-utils';
import * as request from 'supertest';
import { TeamCreateDto } from '../dto/team-create.dto';
import { TeamResponseDto } from '../dto/team-response.dto';
import { TeamService } from '../team.service';
import { Team, User } from '@prisma/client';
import { AuthModule } from '../../auth/auth.module';
import { TeamModule } from '../team.module';
import { UserWithPlayer } from 'src/common/current-user.decorator';
import { TeamQueryParams } from '../interfaces/team-filter.params';
import { TeamTestFactory } from './team.factory';
import e from 'express';
describe('TeamController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let user: UserWithPlayer;
  let team: Team;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TeamModule],
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
  });

  afterEach(async () => {
    await prisma.clearDatabase();
  });

  afterAll(async () => {
    await prisma.clearDatabase();
    await prisma.$disconnect();
  });

  describe('/teams/ (GET)', () => {
    it('should return a paginated list of teams', async () => {
      const res = await request(app.getHttpServer())
        .get('/teams/')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const list = res.body as TeamResponseDto[];
      expect(list).toBeInstanceOf(Array);
      expect(list).toHaveLength(1);
      expect(list[0]).toStrictEqual(TeamTestFactory.response());
    });
    it('should return a paginated list of teams sorted by rating', async () => {
      const teamSecondData = TeamTestFactory.valid();
      await prisma.team.create({
        data: {
          ...teamSecondData,
          name: 'Beta',
          ownerId: user.playerAccount.id,
          rating: -1000,
        },
      });

      const res = await request(app.getHttpServer())
        .get('/teams/')
        .query({ sortBy: 'rating', sortOrder: 'desc' } as TeamQueryParams)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const list = res.body as TeamResponseDto[];
      expect(list).toBeInstanceOf(Array);
      expect(list).toHaveLength(2);
      expect(list[0]).toStrictEqual(TeamTestFactory.response());
    });
    it('should return only teams that current user belongs to', async () => {
      const res = await request(app.getHttpServer())
        .get('/teams/')
        .send({
          filters: { members: [user.playerAccount.id] },
        } as TeamQueryParams)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const list = res.body as TeamResponseDto[];
      expect(list).toBeInstanceOf(Array);
      expect(list).toHaveLength(1);
      expect(list[0]).toStrictEqual(TeamTestFactory.response());
    });
    it('should return only teams that matches search term', async () => {
      const res = await request(app.getHttpServer())
        .get('/teams/')
        .query({ search: team.name } as TeamQueryParams)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const list = res.body as TeamResponseDto[];
      expect(list).toBeInstanceOf(Array);
      expect(list).toHaveLength(1);
      expect(list[0]).toStrictEqual(TeamTestFactory.response());
    });
  });

  describe('/teams/ (POST)', () => {
    beforeEach(async () => {
      await prisma.team.deleteMany();
    });
    it('should create a team', async () => {
      const teamData = TeamTestFactory.valid();
      const res = await request(app.getHttpServer())
        .post('/teams/')
        .send(teamData)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const team = res.body as TeamResponseDto;

      expect(team).toStrictEqual({
        ...TeamTestFactory.response(),
        id: expect.any(Number),
      });
      expect(team.members).toHaveLength(1);
    });
    it('should throw 400 if invalid data is provided', async () => {
      const teamData = TeamTestFactory.invalid();
      const res = await request(app.getHttpServer())
        .post('/teams/')
        .send(teamData)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      await prisma.team
        .findFirst({ where: { name: teamData.name } })
        .then((team) => {
          expect(team).toBeNull();
        });
    });
    it('should throw 409 if team with same name already exists', async () => {
      const initial = TeamTestFactory.valid();
      await prisma.team.create({
        data: { ownerId: user.playerAccount.id, ...initial },
      });

      const teamData = TeamTestFactory.valid();

      const res = await request(app.getHttpServer())
        .post('/teams/')
        .send(teamData)
        .set('Authorization', `Bearer ${token}`)
        .expect(409);

      await prisma.team.findMany().then((teams) => {
        expect(teams).toHaveLength(1);
      });
    });
    it('should throw 401 if user is not authenticated', async () => {
      const teamData = TeamTestFactory.valid();
      const res = await request(app.getHttpServer())
        .post('/teams/')
        .send(teamData)
        .expect(401);
    });
  });
  describe('/teams/:id (GET)', () => {
    it('should return team data for a given id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/teams/${team.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const response = res.body as TeamResponseDto;

      expect(response).toStrictEqual(TeamTestFactory.response());
      expect(response.members).toHaveLength(1);
    });
    it('should return 404 if team doesnt exsist', async () => {
      const res = await request(app.getHttpServer())
        .get(`/teams/${team.id + 999}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      const response = res.body as TeamResponseDto;

      expect(response).not.toStrictEqual(TeamTestFactory.response());
    });
  });
  describe('/teams/:id (PATCH)', () => {
    it('should update team data', async () => {
      const teamData = TeamTestFactory.valid();
      const res = await request(app.getHttpServer())
        .patch(`/teams/${team.id}`)
        .send({ ...teamData, name: 'updated name' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const response = res.body as TeamResponseDto;

      expect(response).toStrictEqual({
        ...TeamTestFactory.response(),
        name: 'updated name',
      });
      expect(response.members).toHaveLength(1);
    });
    it('should throw 409 if trying to change a name to alredy present one', async () => {
      const teamData = TeamTestFactory.valid();
      await prisma.team.create({
        data: {
          ...teamData,
          name: 'existing name',
          ownerId: user.playerAccount.id,
          members: { connect: { id: user.playerAccount.id } },
        },
      });
      const res = await request(app.getHttpServer())
        .patch(`/teams/${team.id}`)
        .send({ ...teamData, name: 'existing name' })
        .set('Authorization', `Bearer ${token}`)
        .expect(409);

      const response = await prisma.team.findUnique({
        where: { id: team.id },
        include: { members: true },
      });

      expect(response).toStrictEqual(TeamTestFactory.response());
      expect(response?.members).toHaveLength(1);
    });
    it('should throw 400 if trying to change a owner to non exsisting player', async () => {
      const teamData = TeamTestFactory.valid();
      const res = await request(app.getHttpServer())
        .patch(`/teams/${team.id}`)
        .send({ ...teamData, ownerId: 9999 })
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
      const response = await prisma.team.findUnique({
        where: { id: team.id },
        include: { members: true },
      });

      expect(response).toStrictEqual(TeamTestFactory.response());
      expect(response?.members).toHaveLength(1);
    });
    it('should throw 403 if trying to change a team settings for a team player is not owning', async () => {
      const userData = validUser();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...userData, email: 'new@gmail.com' });

      const teamData = TeamTestFactory.valid();

      const secondTeam = await prisma.team.create({
        data: {
          ...teamData,
          name: 'existing name',
          ownerId: 2,
          members: { connect: { id: 2 } },
        },
        include: { members: true },
      });
      const res = await request(app.getHttpServer())
        .patch(`/teams/${secondTeam.id}`)
        .send({ ...teamData, name: 'updated name' })
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
      const response = await prisma.team.findUnique({
        where: { id: secondTeam.id },
        include: { members: true },
      });

      expect(response).toStrictEqual(secondTeam);
      expect(response?.members).toHaveLength(1);
    });
  });
  describe('/teams/:id (DELETE)', () => {
    it('should delete the team and return 200', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/teams/${team.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const response = res.body as TeamResponseDto;

      expect(response).toStrictEqual(TeamTestFactory.response());
      expect(response?.members).toHaveLength(1);
    });
    it('should throw 403 if trying to delete the team you are not owning', async () => {
      const userData = validUser();
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...userData, email: 'new@gmail.com' });

      const user = res.body as UserWithPlayer;
      const otherToken = res.body.accessToken;
      await request(app.getHttpServer())
        .delete(`/teams/${team.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
      const response = await prisma.team.findUnique({
        where: { id: team.id },
        include: { members: true },
      });

      expect(response).toStrictEqual(team);
      expect(response?.members).toHaveLength(1);
    });
    it('should throw 404 if trying to delete the team that does not exsist', async () => {
      await request(app.getHttpServer())
        .delete(`/teams/${team.id + 1}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      const response = await prisma.team.findUnique({
        where: { id: team.id },
        include: { members: true },
      });

      expect(response).toStrictEqual(team);
      expect(response?.members).toHaveLength(1);
    });
  });
});
