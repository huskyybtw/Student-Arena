import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma/prisma.service';
import { validUser } from '../user/user.test-utils';
import { RiotService } from '../riot/riot.service';
import { HttpService } from '@nestjs/axios';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LeagueRole, PlayerAccount } from '@prisma/client';
import { AuthModule } from '../auth/auth.module';
import { PlayerResponseDto } from './dto/player-response.dto';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';
import { SummonerDto } from 'src/riot/dto/summoner.dto';
import { PlayerModule } from './player.module';
import { UserWithPlayer } from 'src/common/current-user.decorator';

export function validPuid() {
  return 'Wd5djJX2bD0wsNqz7JU0i6R59fUZxZThD--VLf5SIQziABg2agpahRiMjlPLuuqvFbEof0O4IegRwg';
}

export function inValidPuid() {
  return 'Wd5djJX2bD0wsNqz7JU0i6R59fUZxZThD--VLf5SIQziABg2agpahRiMjlPLuuqvFbEof0O4Ieg123';
}

export function validPreCreatedPlayer() {
  return {
    description: '',
    gameName: null,
    id: 1,
    primaryRole: null,
    profileIconId: null,
    puuid: null,
    secondaryRole: null,
    summonerLevel: null,
    tagLine: null,
    userId: 1,
  };
}

export function validPlayer() {
  return {
    gameName: 'Husky',
    tagLine: '5607',
    primaryRole: LeagueRole.CARRY,
    secondaryRole: LeagueRole.SUPPORT,
    description: 'Test description',
  };
}

export function inValidPlayer() {
  return {
    gameName: 'NonExistentGameName',
    tagLine: '0000',
    primaryRole: LeagueRole.CARRY,
    secondaryRole: LeagueRole.SUPPORT,
    description: 'Test description',
  };
}

export function validProfileIcon() {
  return {
    profileIconId: 6923,
  };
}

describe('PlayerController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let user: UserWithPlayer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlayerModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
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

  describe('/player/ (PUT)', () => {
    it('should return 200 when creating a new player', async () => {
      const playerData = validPlayer();
      const res = await request(app.getHttpServer())
        .put('/player/')
        .send(playerData)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const player = res.body as PlayerResponseDto;
      expect(player.puuid).toEqual(validPuid());
    });

    it('should return 200 when updating a player', async () => {
      const playerData = validPlayer();
      const resOriginal = await request(app.getHttpServer())
        .put('/player/')
        .send(playerData)
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app.getHttpServer())
        .put('/player/')
        .send({ ...playerData, description: 'Updated description' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const original = resOriginal.body as PlayerResponseDto;
      const player = res.body as PlayerResponseDto;

      expect(player.id).toEqual(original.id);
      expect(player.puuid).toEqual(validPuid());
      expect(player.description).toEqual('Updated description');
    });

    it('should return 404 when riot data is invalid', async () => {
      const playerData = inValidPlayer();
      const res = await request(app.getHttpServer())
        .put('/player/')
        .send(playerData)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      await prisma.playerAccount
        .findFirst({ where: { userId: user.id } })
        .then((player) => {
          expect(player?.gameName).toBeNull();
          expect(player?.tagLine).toBeNull();
          expect(player?.puuid).toBeNull();
        });
    });
  });
});
