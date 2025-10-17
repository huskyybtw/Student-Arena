import { AccountDto } from "../dto/account.dto";
import { SummonerDto } from "../dto/summoner.dto";

export interface RiotPlayerMetadata {
  account: AccountDto;
  summoner: SummonerDto;
}
