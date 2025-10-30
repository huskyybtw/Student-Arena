import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}
