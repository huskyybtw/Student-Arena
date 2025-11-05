import { forwardRef, Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RiotModule } from '../riot/riot.module';
import { RiotService } from 'src/riot/riot.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, RiotModule, forwardRef(() => AuthModule)],
  controllers: [PlayerController],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
