import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Nieprawidłowy email")
    .required("Email jest wymagany"),
  password: yup
    .string()
    .min(6, "Hasło musi mieć co najmniej 6 znaków")
    .required("Hasło jest wymagane"),
});

export const signupSchema = yup.object({
  username: yup
    .string()
    .min(3, "Nazwa użytkownika musi mieć co najmniej 3 znaki")
    .required("Nazwa użytkownika jest wymagana"),
  university: yup
    .string()
    .min(2, "Nazwa uczelni jest za krótka")
    .required("Uczelnia jest wymagana"),
  email: yup
    .string()
    .email("Nieprawidłowy email")
    .required("Email jest wymagany"),
  password: yup
    .string()
    .min(6, "Hasło musi mieć co najmniej 6 znaków")
    .required("Hasło jest wymagane"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Hasła muszą być takie same")
    .required("Potwierdzenie hasła jest wymagane"),
});

export type SignupFormData = yup.InferType<typeof signupSchema>;
export type LoginFormData = yup.InferType<typeof loginSchema>;
