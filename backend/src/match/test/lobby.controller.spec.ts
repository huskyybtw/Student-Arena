import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaExceptionFilter } from '../../common/filters/prisma-exception.filter';
import { validUser } from '../../user/test/user.test-utils';
import * as request from 'supertest';
import { MatchModule } from '../match.module';
import { UserWithPlayer } from 'src/common/current-user.decorator';
import { Lobby } from '@prisma/client';
import { LobbyFactory } from './factories/lobby.factory';
import { LobbyPlayerFactory } from './factories/lobby-player.factory';

describe('LobbyController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let user: UserWithPlayer;
  let lobby: Lobby;

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

  describe('/lobby (POST)', () => {
    it('should create lobby');

    it('should throw 400 if invalid data is provided');

    it('should throw 401 if user is not authenticated');
  });

  describe('/lobby (GET)', () => {
    it('should return a paginated list of lobbies');

    it('should filter lobbies by status');

    it('should filter lobbies by matchType');

    it('should search lobbies by title');
  });

  describe('/lobby/:id (GET)', () => {
    it('should return lobby details');

    it('should return 404 if not found');
  });

  describe('/lobby/:id (PATCH)', () => {
    it('should update lobby');

    it('should throw 403 if not owner');
  });

  describe('/lobby/:id (DELETE)', () => {
    it('should delete lobby');

    it('should throw 403 if not owner');

    it('should throw 400 if match ongoing');
  });

  describe('/lobby/:id/join (POST)', () => {
    it('should join lobby');

    it('should throw 400 if already joined');

    it('should throw 400 if team full');
  });

  describe('/lobby/:id/leave (POST)', () => {
    it('should leave lobby');

    it('should throw 400 if not in lobby');
  });

  describe('/lobby/:id/ready (POST)', () => {
    it('should toggle ready status');

    it('should throw 400 if not in lobby');
  });

  describe('/lobby/:id/start (POST)', () => {
    it('should start match');

    it('should throw 403 if not owner');

    it('should throw 400 if not all ready');

    it('should throw 502 if tracking service returns an error');

    it('should throw 503 if tracking service is unavailable');
  });

  describe('/lobby/:id/cancel (POST)', () => {
    it('should cancel match');

    it('should throw 403 if not owner');
  });
});
