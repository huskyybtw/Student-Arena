import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Lobby, MatchStatus } from '@prisma/client';

@Injectable()
export class LobbyPlayersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Join lobby
   */
  async joinLobby() {
    // TODO: Implement
  }

  /**
   * Leave lobby
   */
  async leaveLobby() {
    // TODO: Implement
  }

  /**
   * Toggle ready status
   *
   * Toggles the ready status of a player in a lobby.
   * Players can only toggle their own ready status.
   * Cannot toggle ready status once the match has started.
   *
   * @param lobbyId - The unique identifier of the lobby
   * @param playerId - The ID of the player toggling ready status
   * @returns Updated lobby with all relations
   * @throws NotFoundException if lobby or player not found in lobby
   * @throws BadRequestException if match has already started
   */
  async toggleReady(lobbyId: number, playerId: number): Promise<Lobby> {
    const lobbyPlayer = await this.prisma.lobbyPlayer.findFirst({
      where: {
        lobbyId,
        playerId,
      },
      include: {
        lobby: true,
      },
    });

    if (!lobbyPlayer) {
      throw new NotFoundException('Player not found in this lobby');
    }

    if (lobbyPlayer.lobby.status !== MatchStatus.ONGOING) {
      throw new BadRequestException(
        'Cannot change ready status - match has already started',
      );
    }

    await this.prisma.lobbyPlayer.update({
      where: { id: lobbyPlayer.id },
      data: {
        ready: !lobbyPlayer.ready,
      },
    });

    const updatedLobby = await this.prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: {
        owner: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!updatedLobby) {
      throw new NotFoundException('Lobby not found');
    }

    return updatedLobby;
  }

  /**
   * Check if all players are ready
   */
  async areAllPlayersReady() {
    // TODO: Implement
  }

  /**
   * Get players in lobby
   */
  async getPlayers() {
    // TODO: Implement
  }

  /**
   * Transfer ownership to another player
   */
  async transferOwnership() {
    // TODO: Implement
  }
}
