import { Injectable } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { Or } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}
  async findUsersOrganization(userId: number): Promise<Organization | null> {
    return this.prisma.organization.findFirst({
      where: {
        ownerId: userId,
      },
    });
  }
}
