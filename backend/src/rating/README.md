# Rating Service

## Overview

The Rating Service implements an Elo rating system for both individual players and teams in the Student Arena application. It uses the chess-like linear approximation formula to calculate rating changes after matches.

## Formula

The service uses the **Linear Approximation** formula:

```
R_new = R_old + K((W-L)/2) + (K/4C) × Σ(D_i)
```

Where:

- `R_new` = New rating
- `R_old` = Current rating
- `K` = 32 (K-factor, determines sensitivity of rating changes)
- `C` = 200 (rating constant)
- `W` = Number of wins
- `L` = Number of losses
- `D_i` = Opponent's rating minus player's rating
- `Σ(D_i)` = Sum of all rating differences

## Constants

- **K-factor (K)**: 32 - Controls how much ratings change per match
- **C constant**: 200 - Rating points scale (4C = 800 points ≈ 100% win probability)
- **Minimum Rating**: 100 - Players cannot drop below this rating

## Usage

### 1. Individual Player Matches (Solo Queue)

For matches where individual players are matched and their ratings are updated individually:

```typescript
import { RatingService } from './rating/rating.service';

// Example: 5v5 solo queue match
const winnerIds = [1, 2, 3, 4, 5]; // Player IDs of winners
const loserIds = [6, 7, 8, 9, 10]; // Player IDs of losers

await ratingService.updateIndividualMatchRatings(winnerIds, loserIds);
```

**What happens:**

- Each winner's rating increases based on the losers' ratings
- Each loser's rating decreases based on the winners' ratings
- Individual player ratings in `PlayerAccount` table are updated

### 2. Team Matches (5v5 Team Queue)

For matches where teams compete as a unit:

```typescript
// Example: Team A vs Team B
const winningTeamId = 1; // Team A
const losingTeamId = 2; // Team B

await ratingService.updateTeamMatchRatings(winningTeamId, losingTeamId);
```

**What happens:**

- Winning team's rating increases
- Losing team's rating decreases
- Individual player ratings are NOT affected
- Only team ratings in `Team` table are updated

### 3. Team Rating Calculation

Team ratings are automatically calculated as the average of all team members' individual ratings.

#### Automatic Updates (via SQL Triggers)

Team ratings are automatically updated when:

- A player joins or leaves a team
- A team member's individual rating changes

This is handled by database triggers (see migration file).

#### Manual Updates

You can also manually recalculate team ratings:

```typescript
// Recalculate team rating after roster changes
await ratingService.recalculateTeamRatingOnMemberChange(teamId);

// Or just calculate without updating
const calculatedRating = await ratingService.calculateTeamRating(teamId);
```

## Examples

### Example 1: Solo Queue Match

```typescript
// 5 players win, 5 players lose
// Winners have ratings: [1200, 1150, 1300, 1100, 1250]
// Losers have ratings: [1180, 1220, 1190, 1210, 1200]

await ratingService.updateIndividualMatchRatings(
  [1, 2, 3, 4, 5], // winner IDs
  [6, 7, 8, 9, 10], // loser IDs
);

// Each player's rating is adjusted individually
// Higher rated players gain less from beating lower rated opponents
// Lower rated players lose less when beaten by higher rated opponents
```

### Example 2: Team vs Team Match

```typescript
// Team A (rating: 1250) vs Team B (rating: 1200)
// Team A wins

await ratingService.updateTeamMatchRatings(
  1, // Team A (winner)
  2, // Team B (loser)
);

// Team A's rating increases to ~1266
// Team B's rating decreases to ~1184
// Individual player ratings unchanged
```

### Example 3: Adding a Player to a Team

```typescript
// When a player joins a team, the team rating is automatically updated
await prisma.team.update({
  where: { id: teamId },
  data: {
    members: {
      connect: { id: playerId },
    },
  },
});

// SQL trigger automatically recalculates team rating
// No need to call ratingService.updateTeamRating()
```

## Database Triggers

The service includes SQL triggers that automatically maintain team ratings:

### Trigger 1: Team Member Changes

- **Trigger Name**: `trigger_update_team_rating`
- **Fires On**: INSERT, DELETE, UPDATE on `_TeamMembers` table
- **Purpose**: Updates team rating when members join/leave

### Trigger 2: Player Rating Changes

- **Trigger Name**: `trigger_update_team_ratings_on_player_rating_change`
- **Fires On**: UPDATE of `rating` column on `PlayerAccount` table
- **Purpose**: Updates all teams' ratings when a member's individual rating changes

## Integration Example

```typescript
// In your match controller/service
@Post('matches/solo')
async recordSoloMatch(@Body() matchData: SoloMatchDto) {
  // 1. Record match in database
  const match = await this.matchService.create(matchData);

  // 2. Update player ratings
  await this.ratingService.updateIndividualMatchRatings(
    matchData.winnerIds,
    matchData.loserIds
  );

  // 3. Team ratings update automatically via triggers

  return match;
}

@Post('matches/team')
async recordTeamMatch(@Body() matchData: TeamMatchDto) {
  // 1. Record match in database
  const match = await this.matchService.create(matchData);

  // 2. Update team ratings
  await this.ratingService.updateTeamMatchRatings(
    matchData.winningTeamId,
    matchData.losingTeamId
  );

  return match;
}
```

## Notes

- Initial player rating: 1000 (default in schema)
- Initial team rating: 0 (calculated when members join)
- Minimum rating floor: 100 (ratings cannot go below this)
- Ratings are always rounded to integers
- The K-factor of 32 is standard for intermediate players
- Team ratings are the average of member ratings, not independent

## Testing

```typescript
describe('RatingService', () => {
  it('should increase winner ratings and decrease loser ratings', async () => {
    const initialWinnerRating = 1200;
    const initialLoserRating = 1200;

    await ratingService.updateIndividualMatchRatings([winnerId], [loserId]);

    const winner = await prisma.playerAccount.findUnique({
      where: { id: winnerId },
    });
    const loser = await prisma.playerAccount.findUnique({
      where: { id: loserId },
    });

    expect(winner.rating).toBeGreaterThan(initialWinnerRating);
    expect(loser.rating).toBeLessThan(initialLoserRating);
  });
});
```
