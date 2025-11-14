import { Organization } from '@prisma/client';
import { LobbyResponseDto } from 'src/match/dto/lobby-response.dto';

export class TournamentResponseDto {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  startsAt: Date;
  organizationId: number;
  teamLimit: number;

  lobbies: LobbyResponseDto[];
  organization: Organization;
}
