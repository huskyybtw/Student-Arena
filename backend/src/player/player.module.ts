import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RiotModule } from '../riot/riot.module';

@Module({
  imports: [PrismaModule, RiotModule],
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}
