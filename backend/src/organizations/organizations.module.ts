import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaService],
  providers: [OrganizationsService],
})
export class OrganizationsModule {}
