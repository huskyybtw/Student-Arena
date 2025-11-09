import { LobbyPlayer } from '@prisma/client';

/**
 * Factory for creating test LobbyPlayer data
 */
export class LobbyPlayerFactory {
  static create(overrides?: Partial<LobbyPlayer>): LobbyPlayer {
    return {
      id: 1,
      lobbyId: 1,
      playerId: 1,
      team: 1,
      ready: false,
      joinedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(
    count: number,
    overrides?: Partial<LobbyPlayer>,
  ): LobbyPlayer[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({ id: i + 1, playerId: i + 1, ...overrides }),
    );
  }

  static createTeam(
    team: 1 | 2,
    count: number = 5,
    overrides?: Partial<LobbyPlayer>,
  ): LobbyPlayer[] {
    return this.createMany(count, { team, ...overrides });
  }
}
