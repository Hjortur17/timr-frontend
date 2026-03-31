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
export function formatDuration(value: number, unit: "hours" | "minutes" = "hours"): string {
  const totalMinutes = unit === "hours" ? Math.round(value * 60) : Math.round(value);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}klst`;
  return `${h}klst ${m}min`;
}
