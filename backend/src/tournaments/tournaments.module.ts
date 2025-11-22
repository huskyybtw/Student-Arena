import { Module } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { Prisma } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MatchModule } from 'src/match/match.module';
import { TeamModule } from 'src/team/team.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';

@Module({
  imports: [PrismaModule, MatchModule, TeamModule, OrganizationsModule ],
  providers: [TournamentsService],
  controllers: [TournamentsController],
})
export class TournamentsModule {}
