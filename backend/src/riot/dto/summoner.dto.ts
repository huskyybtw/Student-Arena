export interface SummonerDto {
  profileIconId: number; // ID of the summoner icon associated with the summoner.
  revisionDate: number; // Date last modified (epoch ms). Updated on profile icon change, tutorial, game, or name change.
  puuid: string; // Encrypted PUUID. Exact length of 78 characters.
  summonerLevel: number; // Summoner level associated with the summoner.
}
