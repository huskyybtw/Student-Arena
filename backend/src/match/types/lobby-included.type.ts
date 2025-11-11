import { Lobby, PlayerAccount, LobbyPlayer } from '@prisma/client';

export type LobbyWithRelations = Lobby & {
  owner: PlayerAccount | null;
  players: (LobbyPlayer & { player: PlayerAccount | null })[];
};
