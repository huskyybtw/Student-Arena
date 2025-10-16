import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RiotService } from './riot.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [RiotService],
  exports: [RiotService],
})
export class RiotModule {}
