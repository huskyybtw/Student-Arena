import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaExceptionFilter } from '../../common/filters/prisma-exception.filter';
import { validUser } from '../../user/test/user.test-utils';
import * as request from 'supertest';
import { MatchModule } from '../match.module';
import { UserWithPlayer } from 'src/common/current-user.decorator';

describe('LobbySseController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let user: UserWithPlayer;

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
  });

  afterEach(async () => {
    await prisma.clearDatabase();
  });

  afterAll(async () => {
    await prisma.clearDatabase();
    await prisma.$disconnect();
    await app.close();
  });

  describe('/lobby/sse/stream (GET)', () => {
    it('should establish SSE connection');

    it('should send keepalive messages');

    it('should broadcast events to connected clients');

    it('should handle client disconnection gracefully');
  });
});
