import * as yup from "yup";
import { PlayerResponseDtoPrimaryRole } from "@/lib/api/model/playerResponseDtoPrimaryRole";

const roles = Object.values(PlayerResponseDtoPrimaryRole);

export const gameInfoSchema = yup.object({
  bio: yup.string().max(500, "Opis nie może przekraczać 500 znaków").optional(),
  summonerName: yup.string().optional(),
  tagLine: yup.string().optional(),
  primaryRole: yup.string().oneOf(roles).optional(),
  secondaryRole: yup.string().oneOf(roles).optional(),
});

export type GameInfoFormData = yup.InferType<typeof gameInfoSchema>;
