import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Organization } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrganizationCreateDto } from './dto/organization-create.dto';
import { OrganizationUpdateDto } from './dto/organization-update.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find an organization by ID
   *
   * Retrieves an organization by its unique ID.
   *
   * @param id - The ID of the organization
   * @returns The organization or null if not found
   */
  async findOne(id: number): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });
  }

  /**
   * Find a user's organization
   *
   * Retrieves the organization owned by a specific user.
   *
   * @param userId - The ID of the user
   * @returns The organization or null if not found
   */
  async findUsersOrganization(userId: number): Promise<Organization | null> {
    return this.prisma.organization.findFirst({
      where: {
        ownerId: userId,
      },
    });
  }

  /**
   * Create a new organization
   *
   * Creates an organization with the current user as the owner.
   * Each user can only own one organization.
   *
   * @param userId - The ID of the user creating the organization
   * @param input - Organization creation data
   * @returns The created organization with owner details
   * @throws BadRequestException if user already owns an organization or name is taken
   */
  async create(
    userId: number,
    input: OrganizationCreateDto,
  ): Promise<Organization> {
    // Check if user already owns an organization
    const existingOrganization = await this.findUsersOrganization(userId);

    if (existingOrganization) {
      throw new BadRequestException(
        'User already owns an organization. Each user can only own one organization.',
      );
    }

    // Create the organization with the user as owner
    return await this.prisma.organization.create({
      data: {
        name: input.name,
        ownerId: userId,
      },
      include: {
        owner: true,
      },
    });
  }

  /**
   * Update an organization
   *
   * Updates organization details. Only the organization owner can update it.
   * Allows updating:
   * - Organization name
   * - Owner (transfer ownership to another user)
   *
   * @param organizationId - The ID of the organization to update
   * @param userId - The ID of the user attempting the update
   * @param input - Organization update data
   * @returns The updated organization with owner details
   * @throws NotFoundException if organization not found
   * @throws ForbiddenException if user is not the owner
   * @throws BadRequestException if new owner already owns an organization
   */
  async update(
    organizationId: number,
    userId: number,
    input: OrganizationUpdateDto,
  ): Promise<Organization> {
    // Find the organization
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { owner: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if user is the owner
    if (organization.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the organization owner can update the organization',
      );
    }

    // If changing owner, validate new owner doesn't already own an organization
    if (input.ownerId && input.ownerId !== userId) {
      const newOwnerOrganization = await this.findUsersOrganization(
        input.ownerId,
      );

      if (newOwnerOrganization) {
        throw new BadRequestException(
          'The new owner already owns an organization. Each user can only own one organization.',
        );
      }
    }

    // Update the organization
    return await this.prisma.organization.update({
      where: { id: organizationId },
      data: input,
      include: {
        owner: true,
      },
    });
  }

  /**
   * Delete an organization
   *
   * Deletes an organization. Only the organization owner can delete it.
   *
   * @param organizationId - The ID of the organization to delete
   * @param userId - The ID of the user attempting the deletion
   * @returns The deleted organization
   * @throws NotFoundException if organization not found
   * @throws ForbiddenException if user is not the owner
   */
  async delete(organizationId: number, userId: number): Promise<Organization> {
    // Find the organization
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if user is the owner
    if (organization.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the organization owner can delete the organization',
      );
    }

    // Delete the organization
    return await this.prisma.organization.delete({
      where: { id: organizationId },
    });
  }
}
