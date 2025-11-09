import { Lobby, MatchStatus, MatchType } from '@prisma/client';

/**
 * Factory for creating test Lobby data
 */
export class LobbyFactory {
  static create(overrides?: Partial<Lobby>): Lobby {
    return {
      id: 1,
      title: 'Test Lobby',
      description: 'Test description',
      ranked: false,
      status: MatchStatus.SCHEDULED,
      matchType: MatchType.Queue,
      date: new Date(),
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides?: Partial<Lobby>): Lobby[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({ id: i + 1, ...overrides }),
    );
  }
}
