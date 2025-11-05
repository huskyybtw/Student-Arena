import { PlayerAccount, Team, TeamInvitation } from '@prisma/client';

export type TeamInvitationWithRelations = TeamInvitation & {
  team: Team;
  player: PlayerAccount;
};
