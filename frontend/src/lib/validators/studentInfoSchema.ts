import * as yup from "yup";

export const studentInfoSchema = yup.object({
  university: yup.string().optional(),
  faculty: yup.string().optional(),
  year: yup
    .number()
    .min(1, "Rok studiów musi być większy niż 0")
    .max(5, "Rok studiów musi być mniejszy lub równy 5")
    .optional(),
  studentId: yup.string().optional(),
});

export type StudentInfoFormData = yup.InferType<typeof studentInfoSchema>;
