import { Module } from '@nestjs/common';
import { RiotService } from './riot.service';

@Module({
  providers: [RiotService]
})
export class RiotModule {}
