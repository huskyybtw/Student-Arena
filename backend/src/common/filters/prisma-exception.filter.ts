import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Error, _host: ArgumentsHost) {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2025':
          throw new NotFoundException('Resource not found');
        case 'P2002':
          throw new ConflictException('Unique constraint failed');
        default:
          throw new BadRequestException(exception.message);
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException('Validation Error: ' + exception.message);
    }

    throw new InternalServerErrorException(exception.message);
  }
}
