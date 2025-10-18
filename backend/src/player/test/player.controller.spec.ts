import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../prisma/prisma.service';
import { validUser } from '../../user/test/user.test-utils';
import { PlayerTestFactory } from './player.factory';
import { PlayerResponseDto } from '../dto/player-response.dto';
import { PrismaExceptionFilter } from '../../common/filters/prisma-exception.filter';
import { PlayerModule } from '../player.module';
import { UserWithPlayer } from 'src/common/current-user.decorator';

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
      const playerData = PlayerTestFactory.valid();
      const res = await request(app.getHttpServer())
        .put('/player/')
        .send(playerData)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const player = res.body as PlayerResponseDto;
      expect(player.puuid).toEqual(PlayerTestFactory.validPuid());
    });

    it('should return 200 when updating a player', async () => {
      const playerData = PlayerTestFactory.valid();
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
      expect(player.puuid).toEqual(PlayerTestFactory.validPuid());
      expect(player.description).toEqual('Updated description');
    });

    it('should return 404 when riot data is invalid', async () => {
      const playerData = PlayerTestFactory.invalid();
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
