export interface AccountDto {
  puuid: string; // Encrypted PUUID. Exact length of 78 characters.
  gameName?: string; // May be excluded if the account doesn't have a gameName.
  tagLine?: string; // May be excluded if the account doesn't have a tagLine.
}
