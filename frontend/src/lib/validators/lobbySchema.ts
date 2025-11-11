import * as yup from "yup";
import { LobbyCreateDTOMatchType } from "@/lib/api/model/lobbyCreateDTOMatchType";

const matchTypes = Object.values(LobbyCreateDTOMatchType);

export const lobbySchema = yup.object({
  title: yup
    .string()
    .required("Tytuł jest wymagany")
    .min(3, "Tytuł musi mieć co najmniej 3 znaki")
    .max(100, "Tytuł może mieć maksymalnie 100 znaków"),
  description: yup
    .string()
    .max(500, "Opis może mieć maksymalnie 500 znaków")
    .default(""),
  ranked: yup.boolean().required("Wybierz czy gra jest rankingowa"),
  matchType: yup
    .string()
    .oneOf(matchTypes, "Nieprawidłowy typ meczu")
    .required("Typ meczu jest wymagany"),
  date: yup
    .date()
    .required("Data jest wymagana")
    .min(new Date(), "Data musi być w przyszłości"),
});

export type LobbyFormData = yup.InferType<typeof lobbySchema>;
