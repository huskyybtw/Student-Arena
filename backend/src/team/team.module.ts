import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { RatingModule } from 'src/rating/rating.module';
import { PlayerModule } from 'src/player/player.module';

@Module({
  imports: [PrismaModule, AuthModule, RatingModule, PlayerModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
