import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/is";
import { twMerge } from "tailwind-merge";

dayjs.locale("is");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a duration as "Xklst Ymin".
 * Accepts either total hours (decimal) or total minutes (integer).
 */
/** Format SSN: "1234567890" → "123456-7890" */
export function formatSsn(value: string | null | undefined): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6, 10)}`;
}

/** Format phone: "1234567" → "123 4567" */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)}`;
}

export function formatDuration(value: number, unit: "hours" | "minutes" = "hours"): string {
  const totalMinutes = unit === "hours" ? Math.round(value * 60) : Math.round(value);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}klst`;
  return `${h}klst ${m}min`;
}
