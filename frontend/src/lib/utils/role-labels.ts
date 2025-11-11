import { PlayerResponseDtoPrimaryRole } from "@/lib/api/model/playerResponseDtoPrimaryRole";
import { MatchParticipantResponseDtoRole } from "@/lib/api/model/matchParticipantResponseDtoRole";

type RoleType =
  | PlayerResponseDtoPrimaryRole
  | MatchParticipantResponseDtoRole
  | string;

export const getRoleLabel = (role: RoleType): string => {
  const roleStr = role as string;
  switch (roleStr) {
    case "TOP":
      return "Top";
    case "JUNGLE":
      return "Jungle";
    case "MID":
      return "Mid";
    case "CARRY":
      return "ADC";
    case "SUPPORT":
      return "Support";
    default:
      return roleStr;
  }
};
