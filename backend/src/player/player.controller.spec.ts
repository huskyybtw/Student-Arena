import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma/prisma.service';
import { validUser } from '../user/user.test-utils';
import { RiotService } from '../riot/riot.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LeagueRole } from '@prisma/client';

export function validPlayer(userId: number) {
  return {
    userId,
    gameName: 'TestName',
    tagLine: 'EUW',
    primaryRole: LeagueRole.CARRY,
    secondaryRole: LeagueRole.SUPPORT,
    description: 'Test description',
  };
}

const mockHttpService = {};
const mockConfigService = {
  get: jest.fn().mockReturnValue('mock-api-key'),
};

describe('PlayerController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        PlayerService,
        PrismaService,
        RiotService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Clean up player accounts if needed
    if (prisma.playerAccount) {
      await prisma.playerAccount.deleteMany();
    }
  });

  afterAll(async () => {
    if (prisma && prisma.$disconnect) {
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('/player/ (PUT)', () => {
    it('should return 200 when creating a new player', async () => {
      const userData = validUser();
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData);

      const playerData = validPlayer(registerRes.body.userId);
      const token = registerRes.body.accessToken;

      const res = await request(app.getHttpServer())
        .put('/player/')
        .send(playerData)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
    it('should return 200 when updating a player', () => {
      // scenario: valid data, player updated
    });
    it('should return 404 when player not found', () => {
      // scenario: player does not exist
    });
    it('should return 400 on validation error', () => {
      // scenario: invalid input data
    });
  });
});
