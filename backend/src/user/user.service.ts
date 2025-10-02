import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Service for user management and database operations.
 */
@Injectable()
export class UserService {
  /**
   * Creates an instance of UserService.
   * @param prisma PrismaService for database access
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new user with a hashed password.
   * @param data User creation data
   * @returns The created user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
  }

  /**
   * Finds all users in the database.
   * @returns Array of users
   */
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  /**
   * Finds a user by their ID.
   * @param id User ID
   * @returns The user or null if not found
   */
  async findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Finds a user by a unique field (e.g., email or id).
   * @param where Unique search criteria
   * @returns The user or null if not found
   */
  async findUnique(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({ where });
  }

  /**
   * Updates a user. If password is present, it will be hashed.
   * @param id User ID
   * @param data Update data
   * @returns The updated user
   */
  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    const updateData = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password as string, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Removes a user by ID.
   * @param id User ID
   * @returns The deleted user
   */
  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
