import * as yup from "yup";

export const profileSchema = yup.object({
  email: yup
    .string()
    .email("Nieprawidłowy email")
    .required("Email jest wymagany"),
  currentPassword: yup
    .string()
    .min(6, "Hasło musi mieć co najmniej 6 znaków")
    .optional(),
  newPassword: yup
    .string()
    .min(6, "Hasło musi mieć co najmniej 6 znaków")
    .optional(),
});

export type ProfileFormData = yup.InferType<typeof profileSchema>;
