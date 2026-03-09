import { z } from "zod";

export interface User {
  id: number;
  company_id: number | null;
  name: string;
  email: string;
  is_active: boolean;
  onboarding_step: number;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: number;
  company_id: number;
  title: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: string;
  employees: Employee[];
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  has_account: boolean;
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
    password: z.string().min(8, { message: "Lykilorð verður að vera að minnsta kosti 8 stafir" }),
    password_confirmation: z.string().min(8, {
      message: "Staðfestar lykilorð verður að vera að minnsta kosti 8 stafir",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Lykilorðin eru ekki eins",
    path: ["password_confirmation"],
  });

export type RegisterForm = z.infer<typeof registerFormSchema>;

export const shiftFormSchema = z.object({
  title: z.string().min(1, { message: "Heiti vaktar er nauðsynlegt" }),
  start_time: z.string().min(1, { message: "Upphafstími er nauðsynlegur" }),
  end_time: z.string().min(1, { message: "Lokatími er nauðsynlegur" }),
  notes: z.string().optional(),
});

export type ShiftForm = z.infer<typeof shiftFormSchema>;

export const employeeFormSchema = z.object({
  name: z.string().min(1, { message: "Nafn er nauðsynlegt" }),
  email: z.string().email({ message: "Netfang er ekki gilt" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export type EmployeeForm = z.infer<typeof employeeFormSchema>;
