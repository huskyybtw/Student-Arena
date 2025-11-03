import * as yup from "yup";

export const studentInfoSchema = yup.object({
  university: yup.string().optional(),
  faculty: yup.string().optional(),
  year: yup.string().optional(),
  studentId: yup.string().optional(),
});

export type StudentInfoFormData = yup.InferType<typeof studentInfoSchema>;
