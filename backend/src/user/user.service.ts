import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user with hashed password.
   * @param data User creation data
   * @returns Created User
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
  }

  /**
   * Get all users.
   * @returns Array of User
   */
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  /**
   * Find a user by ID.
   * @param id User ID
   * @returns User or null
   */
  async findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Find a user by unique field (id or email).
   * @param where Unique lookup (id or email)
   * @returns User or null
   */
  async findUnique(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({ where });
  }

  /**
   * Update a user (rehashes password if present).
   * @param id User ID
   * @param data Update data (may include password)
   * @returns Updated User
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
   * Delete a user by ID.
   * @param id User ID
   * @returns Deleted User
   */
  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
