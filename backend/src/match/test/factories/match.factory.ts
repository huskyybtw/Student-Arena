import { Match, MatchParticipant, LeagueRole } from '@prisma/client';

/**
 * Factory for creating test Match data
 */
export class MatchFactory {
  static create(overrides?: Partial<Match>): Match {
    return {
      id: 1,
      lobbyId: 1,
      riotMatchId: 'EUW1_1234567890',
      duration: 1800,
      winningTeam: 1,
      createdAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides?: Partial<Match>): Match[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({
        id: i + 1,
        riotMatchId: `EUW1_123456789${i}`,
        ...overrides,
      }),
    );
  }
}

/**
 * Factory for creating test MatchParticipant data
 */
export class MatchParticipantFactory {
  static create(overrides?: Partial<MatchParticipant>): MatchParticipant {
    return {
      id: 1,
      matchId: 1,
      playerId: 1,
      lobbyPlayerId: 1,
      puuid: 'test-puuid-123',
      championId: 157, // Yasuo
      kills: 5,
      deaths: 3,
      assists: 10,
      cs: 180,
      goldEarned: 12000,
      items: [3031, 3087, 3094], // IE, Statikk, RFC
      spells: [4, 7], // Flash, Heal
      role: LeagueRole.MID,
      ...overrides,
    };
  }

  static createMany(
    count: number,
    overrides?: Partial<MatchParticipant>,
  ): MatchParticipant[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({
        id: i + 1,
        playerId: i + 1,
        puuid: `test-puuid-${i + 1}`,
        ...overrides,
      }),
    );
  }
}
