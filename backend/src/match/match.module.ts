import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RatingModule } from 'src/rating/rating.module';
import { LobbyController } from './controllers/lobby.controller';
import { MatchController } from './controllers/match.controller';
import { LobbyWebhookController } from './controllers/lobby-webhook.controller';
import { LobbySseController } from './controllers/lobby-sse.controller';
import { LobbyService } from './services/lobby.service';
import { LobbyPlayersService } from './services/lobby-players.service';
import { MatchService } from './services/match.service';
import { SseService } from './sse/sse.service';
import { TeamModule } from 'src/team/team.module';

@Module({
  imports: [PrismaModule, AuthModule, RatingModule, TeamModule],
  controllers: [
    LobbyController,
    MatchController,
    LobbyWebhookController,
    LobbySseController,
  ],
  providers: [LobbyService, LobbyPlayersService, MatchService, SseService],
  exports: [LobbyService, LobbyPlayersService, MatchService, SseService],
})
export class MatchModule {}
