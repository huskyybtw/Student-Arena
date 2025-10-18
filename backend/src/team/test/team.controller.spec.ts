import { Test, TestingModule } from '@nestjs/testing';
import { TeamController } from '../team.controller';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaExceptionFilter } from '../../common/filters/prisma-exception.filter';
import { validUser } from '../../user/test/user.test-utils';
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

describe('TeamController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let user: UserWithPlayer;

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
  });

  afterEach(async () => {
    await prisma.clearDatabase();
  });

  afterAll(async () => {
    await prisma.clearDatabase();
    await prisma.$disconnect();
  });

  describe('/teams/ (GET)', () => {
    let team: TeamResponseDto;
    beforeEach(async () => {
      const teamData = TeamTestFactory.valid();
      const res = await request(app.getHttpServer())
        .post('/teams/')
        .send(teamData)
        .set('Authorization', `Bearer ${token}`);
      team = res.body as TeamResponseDto;
    });

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
    it('should create a team', async () => {
      const teamData = TeamTestFactory.valid();
      const res = await request(app.getHttpServer())
        .post('/teams/')
        .send(teamData)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const team = res.body as TeamResponseDto;

      expect(team).toStrictEqual(TeamTestFactory.response());
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
  describe('/teams/:id (GET)', () => {});
  describe('/teams/:id (PATCH)', () => {});
  describe('/teams/:id (DELETE)', () => {});
  describe('/teams/:id/members/ (POST)', () => {});
  describe('/teams/:id/members/ (DELETE)', () => {});
  describe('/teams/:id/members/:id (POST)', () => {});
  describe('/teams/:id/members/:id (DELETE)', () => {});
});
