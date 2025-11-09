import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaExceptionFilter } from '../../common/filters/prisma-exception.filter';
import { validUser } from '../../user/test/user.test-utils';
import * as request from 'supertest';
import { MatchModule } from '../match.module';
import { UserWithPlayer } from 'src/common/current-user.decorator';
import { Lobby, Match } from '@prisma/client';
import { LobbyFactory } from './factories/lobby.factory';
import { MatchFactory } from './factories/match.factory';

describe('MatchController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let user: UserWithPlayer;
  let lobby: Lobby;
  let match: Match;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MatchModule],
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

    const lobbyData = LobbyFactory.create();
    lobby = await prisma.lobby.create({
      data: {
        ...lobbyData,
        ownerId: user.playerAccount.id,
        status: 'COMPLETED',
      },
    });

    const matchData = MatchFactory.create();
    match = await prisma.match.create({
      data: {
        ...matchData,
        lobbyId: lobby.id,
      },
    });
  });

  afterEach(async () => {
    await prisma.clearDatabase();
  });

  afterAll(async () => {
    await prisma.clearDatabase();
    await prisma.$disconnect();
    await app.close();
  });

  describe('/match/lobby/:lobbyId (GET)', () => {
    it('should return match by lobby');

    it('should return 404 if no match yet');
  });

  describe('/match/player/:playerId (GET)', () => {
    it('should return player match history');

    it('should apply filters');

    it('should paginate results');
  });

  describe('/match/player/:playerId/stats (GET)', () => {
    it('should return player statistics');

    it('should calculate win rate correctly');
  });

  describe('/match/webhook (POST)', () => {
    it('should handle match started webhook');

    it('should handle match completed webhook');

    it('should throw 400 if invalid webhook data');
  });
});
