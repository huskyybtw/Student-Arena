import { Module } from '@nestjs/common';
import { PlayerPostingController } from './player-posting.controller';
import { PlayerPostingService } from './player-posting.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TeamPostingController } from './team-posting.controller';
import { TeamPostingService } from './team-posting.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PlayerPostingController, TeamPostingController],
  providers: [PlayerPostingService, TeamPostingService],
  exports: [PlayerPostingService, TeamPostingService],
})
export class PostingModule {}
