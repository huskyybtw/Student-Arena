import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RatingModule } from 'src/rating/rating.module';
import { RiotModule } from 'src/riot/riot.module';
import { TeamModule } from 'src/team/team.module';
import { LobbyController } from './controllers/lobby.controller';
import { MatchController } from './controllers/match.controller';
import { LobbyWebhookController } from './controllers/lobby-webhook.controller';
import { LobbySseController } from './controllers/lobby-sse.controller';
import { LobbyService } from './services/lobby.service';
import { LobbyPlayersService } from './services/lobby-players.service';
import { MatchService } from './services/match.service';
import { MatchTrackingService } from './services/match-tracking.service';
import { SseService } from './sse/sse.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RatingModule,
    TeamModule,
    RiotModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [
    LobbyController,
    MatchController,
    LobbyWebhookController,
    LobbySseController,
  ],
  providers: [
    LobbyService,
    LobbyPlayersService,
    MatchService,
    MatchTrackingService,
    SseService,
  ],
  exports: [
    LobbyService,
    LobbyPlayersService,
    MatchService,
    MatchTrackingService,
    SseService,
  ],
})
export class MatchModule {}
