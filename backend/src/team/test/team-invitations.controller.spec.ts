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
import { Team, TeamInvitation, User } from '@prisma/client';
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
  let secondToken: string;
  let user: UserWithPlayer;
  let secondUser: UserWithPlayer;
  let team: Team;
  let secondTeam: Team;
  let invitation: TeamInvitation;

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

    const secondReg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...userData, email: 'second@gmail.com' });

    secondToken = secondReg.body.accessToken;
    secondUser = secondReg.body.user;

    team = await prisma.team.create({
      data: {
        ...TeamTestFactory.valid(),
        ownerId: user.playerAccount.id,
        members: { connect: { id: user.playerAccount.id } },
      },
      include: { members: true },
    });

    invitation = await prisma.teamInvitation.create({
      data: {
        ...TeamTestFactory.validInvitation(),
      },
      include: { team: true, player: true },
    });

    secondTeam = await prisma.team.create({
      data: {
        ...TeamTestFactory.valid(),
        name: 'Second Team',
        ownerId: user.playerAccount.id,
        members: { connect: { id: user.playerAccount.id } },
      },
    });

    await prisma.teamInvitation.create({
      data: {
        ...TeamTestFactory.validInvitation(),
        teamId: secondTeam.id,
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

  describe.only('/teams/:id/invite/ (GET)', () => {
    it('should return 200 when there are no invitations for this team', async () => {
      await prisma.teamInvitation.deleteMany();
      const res = await request(app.getHttpServer())
        .get('/teams/' + team.id + '/invitations/')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(0);
    });

    it('should return 200 and only invitations for a given team', async () => {
      const res = await request(app.getHttpServer())
        .get('/teams/' + team.id + '/invitations/')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);

      const invitations = res.body as TeamInvitation[];
      expect(invitations[0]).toStrictEqual(
        TeamTestFactory.invitationResponse(),
      );
    });
  });
  describe('/teams/:id/invitations/:id (GET)', () => {
    it('should return only invitations for a given player in a given team', async () => {
      // add aditional invitation to verify filtering

      const res = await request(app.getHttpServer())
        .get(`/teams/${team.id}/invitations/${user.playerAccount.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toMatchObject(TeamTestFactory.invitationResponse());
    });
    it('should return 200 when there are no invitations', async () => {
      await prisma.teamInvitation.deleteMany({
        where: {
          teamId: team.id,
          playerId: user.playerAccount.id,
        },
      });
      const res = await request(app.getHttpServer())
        .get(`/teams/${team.id}/invitations/${user.playerAccount.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(0);
    });
  });
  describe('/teams/:id/invitations/:id (POST)', () => {
    it('should return 201 and invitations a player to a team', async () => {
      await prisma.teamInvitation.deleteMany({
        where: {
          teamId: team.id,
          playerId: user.playerAccount.id,
        },
      });
      const res = await request(app.getHttpServer())
        .post(`/teams/${team.id}/invitations/${user.playerAccount.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(TeamTestFactory.validInvitation().expiresAt)
        .expect(201);
      expect(res.body).toMatchObject(TeamTestFactory.invitationResponse());
    });
    it('should return 403 when trying to invitations a player to unowned team', async () => {
      await prisma.teamInvitation.deleteMany();
      await request(app.getHttpServer())
        .post(`/teams/${team.id}/invitations/${secondUser.playerAccount.id}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .send(TeamTestFactory.validInvitation().expiresAt)
        .expect(403);
    });
    it('should return 409 when trying to invitations alredy inviated player', async () => {
      await request(app.getHttpServer())
        .post(`/teams/${secondTeam.id}/invitations/${user.playerAccount.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(TeamTestFactory.validInvitation().expiresAt)
        .expect(409);
    });
  });
  // describe('/teams/:id/invitations/:id (PATCH)', () => {
  //   it('if logged as a invitationsd user should accept the invitation', async () => {});
  //   it('if logged as a inviting user should revoke the invitation', async () => {});
  // });
  describe('/teams/:id/invitations/:id (PUT)', () => {
    it('if logged as a invitationsd user should accept the invitation', async () => {
      const res = await request(app.getHttpServer())
        .put(`/teams/${team.id}/invitations/${secondUser.playerAccount.id}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);
      const invitation = res.body as TeamInvitation;
      expect(invitation).toMatchObject({
        ...TeamTestFactory.invitationResponse(),
        status: 'accepted',
      });
    });
    it('if logged as a inviting user should revoke the invitation', async () => {
      const res = await request(app.getHttpServer())
        .put(`/teams/${team.id}/invitations/${secondUser.playerAccount.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const invitation = res.body as TeamInvitation;
      expect(invitation).toMatchObject({
        ...TeamTestFactory.invitationResponse(),
        status: 'declined',
      });
    });
  });
  describe('/teams/:id/invitations/:id (DELETE)', () => {
    beforeEach(async () => {
      await prisma.team.update({
        where: { id: team.id },
        data: { members: { connect: { id: secondUser.playerAccount.id } } },
      });
    });
    it('should return 200 and remove a player from a team when current user is a player it self or team owner', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/teams/${team.id}/invitations/${user.playerAccount.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const teamAfter = res.body as Team;
      expect(res.body).toBeDefined();
      expect(teamAfter).toMatchObject(TeamTestFactory.response());

      const deleted = await prisma.team.findUnique({
        where: { id: team.id },
        include: { members: true },
      });
      expect(deleted?.members.some((m) => m.id === user.playerAccount.id)).toBe(
        false,
      );
    });
    it('should return 403 when current user is wants to remove a player from unowned team', async () => {
      await request(app.getHttpServer())
        .delete(`/teams/${team.id}/invitations/${user.playerAccount.id}`)
        .set('Authorization', `Bearer ${secondUser}`)
        .expect(403);
    });
    it('should return 400 when trying to leave a team when player is the team owner', async () => {
      await request(app.getHttpServer())
        .delete(`/teams/${secondTeam.id}/invitations/${user.playerAccount.id}`)
        .set('Authorization', `Bearer ${user.playerAccount.id}`)
        .expect(400);

      const teamAfter = await prisma.team.findUnique({
        where: { id: secondTeam.id },
        include: { members: true },
      });
      expect(teamAfter).toBeDefined();
      expect(teamAfter).toMatchObject(TeamTestFactory.response());
    });
  });
});
