import { Test, TestingModule } from '@nestjs/testing';
import { TeamController } from './team.controller';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';
import { validUser } from '../user/user.test-utils';
import * as request from 'supertest';
import { TeamCreateDto } from './dto/team-create.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { TeamService } from './team.service';
import { User } from '@prisma/client';
import { AuthModule } from '../auth/auth.module';
import { TeamModule } from './team.module';

export function validTeamData(): TeamCreateDto {
  return { name: 'Team Alpha', tag: 'ALP', description: 'A sample team' };
}

export function inValidTeamData() {
  return { name: 'Team Alpha' };
}

describe('TeamController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let user: User;

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

  describe('/teams/ (GET)', () => {});
  describe('/teams/ (POST)', () => {
    it('should create a team', async () => {
      const teamData = validTeamData();
      const res = await request(app.getHttpServer())
        .post('/teams/')
        .send(teamData)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const team = res.body as TeamResponseDto;
      console.log('Created team:', team);
      expect(team.ownerId).toBe(user.id);
      expect(team.name).toBe(teamData.name);
      expect(team.members).toHaveLength(1);
    });
    it('should throw 400 if invalid data is provided', async () => {
      const teamData = inValidTeamData();
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
      const initial = validTeamData();
      await prisma.team.create({ data: { ownerId: user.id, ...initial } });

      const teamData = validTeamData();

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
      const teamData = validTeamData();
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
