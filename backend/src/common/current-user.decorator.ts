import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from './custom-request';
import { User } from '@prisma/client';

export const CurrentUser = createParamDecorator<unknown, User>(
  (_data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<CustomRequest>();
    return request.user;
  },
);
