import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const validUser = (): Prisma.UserCreateInput => ({
  email: 'test@example.com',
  password: 'testpassword',
});

export const createValidUser = async (prisma: PrismaService): Promise<User> => {
  const userData = validUser();
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  return prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });
};
