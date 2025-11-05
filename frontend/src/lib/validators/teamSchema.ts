import * as yup from "yup";

export const createTeamSchema = yup.object({
  name: yup.string().required("Nazwa drużyny jest wymagana"),
  tag: yup
    .string()
    .required("Tag drużyny jest wymagany")
    .max(5, "Tag może mieć maksymalnie 5 znaków"),
  description: yup.string().required("Opis jest wymagany"),
});

export const updateTeamSchema = yup.object({
  name: yup.string().required("Nazwa jest wymagana"),
  tag: yup
    .string()
    .max(5, "Tag może mieć maksymalnie 5 znaków")
    .required("Tag jest wymagany"),
  description: yup.string().required("Opis jest wymagany"),
});

export type CreateTeamFormData = yup.InferType<typeof createTeamSchema>;
export type UpdateTeamFormData = yup.InferType<typeof updateTeamSchema>;
