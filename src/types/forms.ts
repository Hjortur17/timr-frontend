import { z } from "zod";

export type CompanyRole = "owner" | "admin" | "accountant";

export interface Company {
  id: number;
  name: string;
  role: CompanyRole;
}

export interface User {
  id: number;
  company_id: number | null;
  companies: Company[];
  name: string;
  email: string;
  is_active: boolean;
  onboarding_step: number;
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
  ssn: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  has_account: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShiftAssignment {
  id: number;
  shift_id: number;
  employee_id: number;
  date: string;
  published: boolean;
  published_date: string | null;
  published_employee_id: number | null;
  has_unpublished_changes: boolean;
  shift: Shift;
  employee: Employee;
  created_at: string;
  updated_at: string;
}

export interface ClockEntry {
  id: number;
  shift_id: number | null;
  employee_id: number;
  clocked_in_at: string;
  clocked_out_at: string | null;
  total_minutes: number | null;
  is_extra: boolean;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  shift?: { id: number; title: string };
  employee?: { id: number; name: string; email: string | null };
}

export const companyFormSchema = z.object({
  name: z.string().min(1, { message: "Nafn fyrirtækis er nauðsynlegt" }),
});

export type CompanyForm = z.infer<typeof companyFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.boolean().optional().default(false),
});

export type LoginForm = z.infer<typeof loginFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z.string().email({ message: "Netfang er ekki gilt" }),
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    token: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8, { message: "Lykilorð verður að vera að minnsta kosti 8 stafir" }),
    password_confirmation: z.string().min(8, {
      message: "Staðfestar lykilorð verður að vera að minnsta kosti 8 stafir",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Lykilorðin eru ekki eins",
    path: ["password_confirmation"],
  });

export type ResetPasswordForm = z.infer<typeof resetPasswordFormSchema>;

export const registerFormSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    password: z.string().min(8, { message: "Lykilorð verður að vera að minnsta kosti 8 stafir" }),
    password_confirmation: z.string().min(8, {
      message: "Staðfestar lykilorð verður að vera að minnsta kosti 8 stafir",
    }),
    invite_token: z.string().optional(),
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
  ssn: z.string().max(10).optional().or(z.literal("")),
  email: z.string().email({ message: "Netfang er ekki gilt" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export type EmployeeForm = z.infer<typeof employeeFormSchema>;

export type PatternType = "2-2-3" | "5-5-4" | "5-2" | "4-3" | "custom";

export interface ShiftTemplate {
  id: number;
  company_id: number;
  name: string;
  description: string | null;
  shift_id: number;
  pattern: PatternType;
  blocks: number[];
  cycle_length_days: number;
  shift: Shift;
  employees: Employee[];
  created_at: string;
  updated_at: string;
}

export const shiftTemplateFormSchema = z.object({
  name: z.string().min(1, { message: "Nafn er nauðsynlegt" }),
  description: z.string().optional().or(z.literal("")),
  shift_id: z.number().int().min(1, { message: "Vakt er nauðsynleg" }),
  pattern: z.enum(["2-2-3", "5-5-4", "5-2", "4-3", "custom"]),
  blocks: z.array(z.number().int().min(1)).min(1),
  employee_ids: z.array(z.number().int()).min(1, { message: "Velja þarf a.m.k. einn starfsmann" }),
});

export type ShiftTemplateForm = z.infer<typeof shiftTemplateFormSchema>;

export const generateScheduleFormSchema = z.object({
  start_date: z.string().min(1, { message: "Upphafsdagur er nauðsynlegur" }),
  end_date: z.string().min(1, { message: "Lokadagur er nauðsynlegur" }),
});

export type GenerateScheduleForm = z.infer<typeof generateScheduleFormSchema>;

export type VacationRequestStatus = "pending" | "approved" | "denied" | "cancelled";

export interface VacationRequest {
  id: number;
  company_id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  working_days_count: number;
  status: VacationRequestStatus;
  employee_note: string | null;
  reviewer_note: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  cancelled_at: string | null;
  employee?: Employee;
  reviewer?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface VacationPolicy {
  id: number;
  company_id: number;
  default_days_per_year: number;
  vacation_year_start_month: number;
  vacation_year_start_day: number;
  allow_carry_over: boolean;
  max_carry_over_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface VacationBalance {
  entitled: number;
  used: number;
  pending: number;
  remaining: number;
  vacation_year_start: string;
  vacation_year_end: string;
}

export const vacationRequestFormSchema = z.object({
  start_date: z.string().min(1, { message: "Upphafsdagur er nauðsynlegur" }),
  end_date: z.string().min(1, { message: "Lokadagur er nauðsynlegur" }),
  note: z.string().optional().or(z.literal("")),
});

export type VacationRequestForm = z.infer<typeof vacationRequestFormSchema>;

export interface ShiftDeletionPreview {
  total_assignments: number;
  total_employees: number;
  future_assignments: number;
  future_employees: number;
  replacement_shifts: Array<{ id: number; title: string; start_time: string; end_time: string }>;
}
