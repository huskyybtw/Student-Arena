import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service for calculating and updating player and team ratings using Elo rating system.
 *
 * Uses the linear approximation formula:
 * R_new = R_old + K((W-L)/2) + (K/4C) * Σ(D_i)
 *
 * Where:
 * - R_new and R_old are the player's new and old ratings
 * - D_i is the opponent's rating minus the player's rating
 * - W is the number of wins, L is the number of losses
 * - C = 200 (rating constant)
 * - K = 32 (K-factor for rating change sensitivity)
 */
@Injectable()
export class RatingService {
  private readonly K = 32; // K-factor: determines rating change sensitivity
  private readonly C = 200; // Rating constant

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates new rating for a player using Elo linear approximation formula.
   *
   * @param currentRating - Player's current rating
   * @param opponentRatings - Array of opponent ratings
   * @param wins - Number of wins (0 or 1 for single match)
   * @param losses - Number of losses (0 or 1 for single match)
   * @returns The new calculated rating
   */
  private calculateNewRating(
    currentRating: number,
    opponentRatings: number[],
    wins: number,
    losses: number,
  ): number {
    // Calculate (W-L)/2 term
    const scoreChange = (wins - losses) / 2;

    // Calculate Σ(D_i) where D_i = opponent_rating - player_rating
    const ratingDifferenceSum = opponentRatings.reduce(
      (sum, opponentRating) => sum + (opponentRating - currentRating),
      0,
    );

    // Apply the formula: R_new = R_old + K((W-L)/2) + (K/4C) * Σ(D_i)
    const newRating =
      currentRating +
      this.K * scoreChange +
      (this.K / (4 * this.C)) * ratingDifferenceSum;

    // Ensure rating doesn't go below a minimum threshold (e.g., 100)
    return Math.max(100, Math.round(newRating));
  }

  /**
   * Updates ratings for individual player matches (solo queue).
   * Each player's rating is updated individually based on match outcome.
   *
   * @param winnerIds - Array of player IDs who won the match
   * @param loserIds - Array of player IDs who lost the match
   */
  async updateIndividualMatchRatings(
    winnerIds: number[],
    loserIds: number[],
  ): Promise<void> {
    // Fetch all players involved in the match
    const allPlayerIds = [...winnerIds, ...loserIds];
    const players = await this.prisma.playerAccount.findMany({
      where: { id: { in: allPlayerIds } },
    });

    const playerMap = new Map(players.map((p) => [p.id, p.rating]));

    // Update winners
    for (const winnerId of winnerIds) {
      const currentRating = playerMap.get(winnerId)!;
      const opponentRatings = loserIds.map((id) => playerMap.get(id)!);

      const newRating = this.calculateNewRating(
        currentRating,
        opponentRatings,
        1, // 1 win
        0, // 0 losses
      );

      await this.prisma.playerAccount.update({
        where: { id: winnerId },
        data: { rating: newRating },
      });
    }

    // Update losers
    for (const loserId of loserIds) {
      const currentRating = playerMap.get(loserId)!;
      const opponentRatings = winnerIds.map((id) => playerMap.get(id)!);

      const newRating = this.calculateNewRating(
        currentRating,
        opponentRatings,
        0, // 0 wins
        1, // 1 loss
      );

      await this.prisma.playerAccount.update({
        where: { id: loserId },
        data: { rating: newRating },
      });
    }
  }

  /**
   * Calculates average rating for a team based on its members.
   *
   * @param teamId - The team ID
   * @returns The calculated average rating
   */
  async calculateTeamRating(teamId: number): Promise<number> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team || team.members.length === 0) {
      return 0;
    }

    const totalRating = team.members.reduce(
      (sum, member) => sum + member.rating,
      0,
    );
    const averageRating = Math.round(totalRating / team.members.length);

    return averageRating;
  }

  /**
   * Updates the team rating in the database based on team members' ratings.
   *
   * @param teamId - The team ID to update
   * @returns The updated team with new rating
   */
  async updateTeamRating(teamId: number) {
    const newRating = await this.calculateTeamRating(teamId);

    return this.prisma.team.update({
      where: { id: teamId },
      data: { rating: newRating },
    });
  }

  /**
   * Updates ratings for team matches (5v5 team queue).
   * Team members' individual ratings are NOT affected, only team rating is updated.
   *
   * @param winningTeamId - ID of the winning team
   * @param losingTeamId - ID of the losing team
   */
  async updateTeamMatchRatings(
    winningTeamId: number,
    losingTeamId: number,
  ): Promise<void> {
    // Get both teams with their current ratings
    const [winningTeam, losingTeam] = await Promise.all([
      this.prisma.team.findUnique({
        where: { id: winningTeamId },
      }),
      this.prisma.team.findUnique({
        where: { id: losingTeamId },
      }),
    ]);

    if (!winningTeam || !losingTeam) {
      throw new Error('One or both teams not found');
    }

    // Calculate new ratings for teams
    const winningTeamNewRating = this.calculateNewRating(
      winningTeam.rating,
      [losingTeam.rating],
      1, // 1 win
      0, // 0 losses
    );

    const losingTeamNewRating = this.calculateNewRating(
      losingTeam.rating,
      [winningTeam.rating],
      0, // 0 wins
      1, // 1 loss
    );

    // Update both teams' ratings
    await Promise.all([
      this.prisma.team.update({
        where: { id: winningTeamId },
        data: { rating: winningTeamNewRating },
      }),
      this.prisma.team.update({
        where: { id: losingTeamId },
        data: { rating: losingTeamNewRating },
      }),
    ]);
  }

  /**
   * Recalculates and updates team rating when team composition changes.
   * Call this after adding or removing team members.
   *
   * @param teamId - The team ID to recalculate
   */
  async recalculateTeamRatingOnMemberChange(teamId: number) {
    return this.updateTeamRating(teamId);
  }
}
