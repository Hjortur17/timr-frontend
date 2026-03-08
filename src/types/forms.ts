import { z } from "zod";

export interface User {
  id: number;
  company_id: number | null;
  name: string;
  email: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export const companyFormSchema = z.object({
  name: z.string().min(1, { message: "Nafn fyrirtækis er nauðsynlegt" }),
});

export type CompanyForm = z.infer<typeof companyFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginForm = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    password: z
      .string()
      .min(8, { message: "Lykilorð verður að vera að minnsta kosti 8 stafir" }),
    password_confirmation: z
      .string()
      .min(8, {
        message: "Staðfestar lykilorð verður að vera að minnsta kosti 8 stafir",
      }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Lykilorðin eru ekki eins",
    path: ["password_confirmation"],
  });

export type RegisterForm = z.infer<typeof registerFormSchema>;
