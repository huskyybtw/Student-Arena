import { Request } from 'express';
import { PlayerAccount, User } from '@prisma/client';
import { UserWithPlayer } from './current-user.decorator';

export interface CustomRequest extends Request {
  user: UserWithPlayer;
}
