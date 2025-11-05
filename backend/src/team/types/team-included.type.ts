import { PlayerAccount, Team } from '@prisma/client';

export type TeamWithRelations = Team & { members: PlayerAccount[] };
