import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { RatingModule } from 'src/rating/rating.module';
import { PlayerModule } from 'src/player/player.module';
import { TeamInvitationsController } from './team-invitations.controller';
import { TeamInvitationsService } from './team-invitations.service';

@Module({
  imports: [PrismaModule, AuthModule, RatingModule, PlayerModule],
  controllers: [TeamController, TeamInvitationsController],
  providers: [TeamService, TeamInvitationsService],
  exports: [TeamService, TeamInvitationsService],
})
export class TeamModule {}
