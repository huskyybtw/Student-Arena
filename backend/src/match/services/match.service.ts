import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebhookMatchDTO } from '../dto/webhook-match.dto';
import { Match, MatchStatus, LeagueRole } from '@prisma/client';
import { RiotService } from 'src/riot/riot.service';
import { SseService } from '../sse/sse.service';
import { RatingService } from 'src/rating/rating.service';
import {
  MatchResponseDto,
  MatchParticipantResponseDto,
} from '../dto/match-response.dto';
import { MatchQueryDto } from '../interfaces/match-query.dto';

@Injectable()
export class MatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly riotService: RiotService,
    private readonly sseService: SseService,
    private readonly ratingService: RatingService,
  ) {}

  /**
   * Handle match started webhook
   *
   * Called by the tracking service when a match is detected to have started.
   * Creates a Match record and links it to the lobby.
   *
   * @param data - Webhook payload with lobbyId and riotMatchId
   * @returns Created match record
   * @throws NotFoundException if lobby not found
   * @throws BadRequestException if match already exists for this lobby
   */
  async handleMatchStarted(data: WebhookMatchDTO): Promise<Match> {
    const lobby = await this.prisma.lobby.findUnique({
      where: { id: data.lobbyId },
      include: { match: true },
    });

    if (!lobby) {
      throw new NotFoundException(`Lobby with ID ${data.lobbyId} not found`);
    }

    if (lobby.match) {
      throw new BadRequestException(
        `Match already exists for lobby ${data.lobbyId}`,
      );
    }

    const updatedLobby = await this.prisma.lobby.update({
      where: { id: lobby.id },
      data: {
        status: MatchStatus.ONGOING,
      },
      include: {
        owner: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    const match = await this.prisma.match.create({
      data: {
        lobbyId: data.lobbyId,
        riotMatchId: data.riotMatchId,
      },
    });

    // Emit SSE events to clients watching this lobby
    this.sseService.emitToLobby(data.lobbyId, 'lobby:status-changed', {
      lobbyId: data.lobbyId,
      status: MatchStatus.ONGOING,
    });

    this.sseService.emitToLobby(data.lobbyId, 'match:started', {
      lobbyId: data.lobbyId,
      matchId: match.id,
      riotMatchId: data.riotMatchId,
    });

    return match;
  }

  /**
   * Handle match completed webhook
   *
   * Called by the tracking service when a match is detected to have completed.
   * Fetches match data from Riot API and stores it in the database.
   *
   * @param data - Webhook payload with lobbyId and riotMatchId
   * @returns Updated match record
   * @throws NotFoundException if match not found
   * @throws BadRequestException if match already completed
   */
  async handleMatchCompleted(data: WebhookMatchDTO): Promise<Match> {
    const match = await this.prisma.match.findUnique({
      where: { riotMatchId: data.riotMatchId },
      include: {
        lobby: {
          include: {
            players: {
              include: {
                player: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException(
        `Match with Riot ID ${data.riotMatchId} not found`,
      );
    }

    const matchData = await this.riotService.getMatchById(data.riotMatchId);

    // Parse match info
    const gameDuration = matchData.info.gameDuration; // in seconds
    const participants = matchData.info.participants;

    // Determine winning team (100 or 200)
    const winningTeam = participants.find((p: any) => p.win)?.teamId;

    await this.prisma.match.update({
      where: { id: match.id },
      data: {
        duration: gameDuration,
        winningTeam: winningTeam,
      },
    });

    for (const participant of participants) {
      // Find the lobby player by puuid
      const lobbyPlayer = match.lobby.players.find(
        (lp) => lp.player?.puuid === participant.puuid,
      );

      if (lobbyPlayer) {
        const participantData = this.createMatchParticipantData(
          match.id,
          lobbyPlayer,
          participant,
        );

        await this.prisma.matchParticipant.create({
          data: participantData,
        });
      }
    }

    await this.prisma.lobby.update({
      where: { id: match.lobbyId },
      data: { status: MatchStatus.COMPLETED },
    });

    // Emit SSE events to clients watching this lobby
    this.sseService.emitToLobby(match.lobbyId, 'lobby:status-changed', {
      lobbyId: match.lobbyId,
      status: MatchStatus.COMPLETED,
    });

    this.sseService.emitToLobby(match.lobbyId, 'match:completed', {
      lobbyId: match.lobbyId,
      matchId: match.id,
      riotMatchId: data.riotMatchId,
    });

    if (match.lobby.ranked) {
      // await this.ratingService.updateRatingsForMatch(
      //   match.id,
      //   match.lobbyId,
      //   match.lobby.matchType,
      // );
    }

    return match;
  }

  /**
   * Creates match participant data object from Riot API participant
   *
   * @param matchId - ID of the match
   * @param lobbyPlayer - The lobby player record
   * @param participant - Riot API participant data
   * @returns Data object ready for MatchParticipant.create()
   */
  private createMatchParticipantData(
    matchId: number,
    lobbyPlayer: any,
    participant: any,
  ) {
    const role = this.mapRiotRoleToLeagueRole(
      participant.teamPosition,
      participant.individualPosition,
    );

    return {
      matchId: matchId,
      lobbyPlayerId: lobbyPlayer.id,
      playerId: lobbyPlayer.playerId,
      puuid: participant.puuid,
      championId: participant.championId,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
      goldEarned: participant.goldEarned,
      items: [
        participant.item0,
        participant.item1,
        participant.item2,
        participant.item3,
        participant.item4,
        participant.item5,
        participant.item6,
      ].filter((item) => item !== 0),
      spells: [participant.summoner1Id, participant.summoner2Id],
      role: role,
    };
  }

  /**
   * Maps Riot API role/position strings to our LeagueRole enum
   *
   * @param teamPosition - The team position from Riot API
   * @param individualPosition - The individual position from Riot API (fallback)
   * @returns Mapped LeagueRole enum value
   */
  private mapRiotRoleToLeagueRole(
    teamPosition: string,
    individualPosition: string,
  ): LeagueRole {
    const position = teamPosition || individualPosition;

    switch (position?.toUpperCase()) {
      case 'TOP':
        return LeagueRole.TOP;
      case 'JUNGLE':
        return LeagueRole.JUNGLE;
      case 'MIDDLE':
      case 'MID':
        return LeagueRole.MID;
      case 'BOTTOM':
      case 'ADC':
        return LeagueRole.CARRY;
      case 'UTILITY':
      case 'SUPPORT':
        return LeagueRole.SUPPORT;
      default:
        return LeagueRole.MID;
    }
  }

  /**
   * Find match by either Riot match ID or lobby ID
   *
   * @param query - Query with either riotMatchId or lobbyId
   * @returns Match details with participants
   * @throws BadRequestException if neither or both parameters provided
   * @throws NotFoundException if match not found
   */
  async findMatch(query: MatchQueryDto): Promise<MatchResponseDto> {
    // Validate that exactly one parameter is provided
    if (!query.riotMatchId && !query.lobbyId) {
      throw new BadRequestException(
        'Either riotMatchId or lobbyId must be provided',
      );
    }

    if (query.riotMatchId && query.lobbyId) {
      throw new BadRequestException(
        'Provide only one of: riotMatchId or lobbyId',
      );
    }

    // Build where clause based on provided parameter
    const where = query.riotMatchId
      ? { riotMatchId: query.riotMatchId }
      : { lobbyId: query.lobbyId };

    const match = await this.prisma.match.findUnique({
      where,
      include: {
        participants: {
          include: {
            player: true,
            lobbyPlayer: true,
          },
        },
      },
    });

    if (!match) {
      const identifier = query.riotMatchId
        ? `Riot match ID ${query.riotMatchId}`
        : `lobby ID ${query.lobbyId}`;
      throw new NotFoundException(`Match with ${identifier} not found`);
    }

    return this.formatMatchResponse(match);
  }

  /**
   * Format match data into response DTO
   *
   * @param match - Match with participants from database
   * @returns Formatted match response
   */
  private formatMatchResponse(match: any): MatchResponseDto {
    const participants: MatchParticipantResponseDto[] = match.participants.map(
      (p: any) => ({
        id: p.id,
        playerId: p.playerId,
        playerName: p.player.gameName
          ? `${p.player.gameName}#${p.player.tagLine}`
          : 'Unknown',
        puuid: p.puuid,
        championId: p.championId,
        role: p.role,
        teamId: p.lobbyPlayer.teamId,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        cs: p.cs,
        goldEarned: p.goldEarned,
        items: p.items,
        spells: p.spells,
      }),
    );

    return {
      id: match.id,
      lobbyId: match.lobbyId,
      riotMatchId: match.riotMatchId,
      duration: match.duration,
      winningTeam: match.winningTeam,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      participants: participants,
    };
  }
}
