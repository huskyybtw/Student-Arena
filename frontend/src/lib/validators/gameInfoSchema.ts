import * as yup from "yup";
import { PlayerResponseDtoPrimaryRole } from "@/lib/api/model/playerResponseDtoPrimaryRole";

const roles = Object.values(PlayerResponseDtoPrimaryRole);

export const gameInfoSchema = yup.object({
  bio: yup.string().optional(),
  summonerName: yup.string().optional(),
  tagLine: yup.string().optional(),
  primaryRole: yup
    .string()
    .oneOf([...roles, undefined])
    .optional(),
  secondaryRole: yup
    .string()
    .oneOf([...roles, undefined])
    .optional(),
});

export type GameInfoFormData = yup.InferType<typeof gameInfoSchema>;
