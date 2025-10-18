import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from './custom-request';
import { PlayerAccount, User } from '@prisma/client';
export type UserWithPlayer = User & { playerAccount: PlayerAccount };

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<CustomRequest>();
    return request.user;
  },
);
