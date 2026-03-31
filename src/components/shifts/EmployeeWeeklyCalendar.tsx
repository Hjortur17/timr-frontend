"use client";

import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDuration } from "@/lib/utils";
import type { ShiftAssignment } from "@/types/forms";
import { authHeaders } from "@/utils/auth";
import { cn } from "@/utils/classname";

dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);

const DAY_LABELS = ["MÁN", "ÞRI", "MIÐ", "FIM", "FÖS", "LAU", "SUN"];

const SHIFT_COLORS = [
  { bg: "bg-emerald-200", text: "text-emerald-800" },
  { bg: "bg-orange-200", text: "text-orange-800" },
  { bg: "bg-cyan-200", text: "text-cyan-800" },
  { bg: "bg-violet-200", text: "text-violet-800" },
  { bg: "bg-rose-200", text: "text-rose-800" },
  { bg: "bg-blue-200", text: "text-blue-800" },
  { bg: "bg-amber-200", text: "text-amber-800" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getShiftColor(title: string) {
  return SHIFT_COLORS[hashString(title) % SHIFT_COLORS.length];
}

function formatShiftTime(time: string): string {
  const d = dayjs(time, ["HH:mm:ss", "HH:mm"], true);
  return d.isValid() ? d.format("HH:mm") : time;
}

function durationMinutes(startTime: string, endTime: string): number {
  const s = dayjs(startTime, ["HH:mm:ss", "HH:mm"], true);
  const e = dayjs(endTime, ["HH:mm:ss", "HH:mm"], true);
  return e.diff(s, "minute");
}

function getWeekDays(weekStart: dayjs.Dayjs): dayjs.Dayjs[] {
  return Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
}

export default function EmployeeWeeklyCalendar() {
  const [weekStart, setWeekStart] = useState(() => dayjs().startOf("isoWeek"));
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekEnd = weekDays[6];

  useEffect(() => {
    setLoading(true);
    const from = weekStart.format("YYYY-MM-DD");
    const to = weekEnd.format("YYYY-MM-DD");
    axios
      .get(`/api/employee/shifts?from=${from}&to=${to}`, {
        headers: authHeaders(),
      })
      .then((res) => setAssignments(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [weekStart, weekEnd]);

  /** Map<dayIndex (0-6), ShiftAssignment[]> */
  const assignmentsByDay = useMemo(() => {
    const map = new Map<number, ShiftAssignment[]>();
    for (const a of assignments) {
      const dayIndex = dayjs(a.date).isoWeekday() - 1;
      const list = map.get(dayIndex) ?? [];
      list.push(a);
      map.set(dayIndex, list);
    }
    return map;
  }, [assignments]);

  const totalWeekMinutes = useMemo(() => {
    return assignments.reduce((sum, a) => sum + durationMinutes(a.shift.start_time, a.shift.end_time), 0);
  }, [assignments]);

  const today = dayjs();
  const isCurrentWeek = today.isoWeek() === weekStart.isoWeek() && today.year() === weekStart.year();

  const prevWeek = () => setWeekStart((w) => w.subtract(1, "week"));
  const nextWeek = () => setWeekStart((w) => w.add(1, "week"));
  const goToday = () => setWeekStart(dayjs().startOf("isoWeek"));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-500">Hleð vöktum...</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Week Navigation */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevWeek}
            className="rounded-lg border border-neutral-300 p-2 hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="size-4 text-neutral-600" />
          </button>
          <button
            type="button"
            onClick={nextWeek}
            className="rounded-lg border border-neutral-300 p-2 hover:bg-neutral-50 transition-colors"
          >
            <ChevronRight className="size-4 text-neutral-600" />
          </button>
        </div>
        {!isCurrentWeek && (
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Í dag
          </button>
        )}
        <h2 className="text-lg font-semibold text-neutral-900">
          {weekStart.format("D. MMM")} – {weekEnd.format("D. MMM YYYY")}
        </h2>
        {totalWeekMinutes > 0 && (
          <span className="ml-auto text-sm text-neutral-500">
            {formatDuration(totalWeekMinutes, "minutes")} þessi vika
          </span>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="min-w-[640px]">
          {/* Header Row */}
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
            {weekDays.map((day, i) => {
              const isToday = day.isSame(today, "day");
              return (
                <div
                  key={DAY_LABELS[i]}
                  className={cn(
                    "border-l first:border-l-0 border-neutral-200 px-3 py-2.5 text-center",
                    isToday && "bg-primary/5",
                  )}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    {DAY_LABELS[i]}
                  </div>
                  <div className={cn("mt-0.5 text-xl font-bold", isToday ? "text-primary" : "text-neutral-900")}>
                    {day.date()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7">
            {weekDays.map((day, i) => {
              const dayAssignments = assignmentsByDay.get(i) ?? [];
              const isToday = day.isSame(today, "day");

              return (
                <div
                  key={DAY_LABELS[i]}
                  className={cn(
                    "min-h-32 border-l first:border-l-0 border-neutral-100 p-2 flex flex-col gap-1.5",
                    isToday && "bg-primary/5",
                  )}
                >
                  {dayAssignments.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs text-neutral-300">—</span>
                    </div>
                  ) : (
                    dayAssignments.map((assignment) => {
                      const color = getShiftColor(assignment.shift.title);
                      return (
                        <div
                          key={assignment.id}
                          className="w-full gap-2 rounded-lg flex items-center text-xs bg-neutral-200/50 py-2 px-3"
                        >
                          <div className={cn("h-3 w-3 rounded-full shrink-0", color.bg)} />
                          <div className="flex-1 flex flex-col items-start gap-0.5 min-w-0">
                            <div className="font-semibold truncate">{assignment.shift.title}</div>
                            <div className="font-medium opacity-90 shrink-0">
                              {formatShiftTime(assignment.shift.start_time)}–
                              {formatShiftTime(assignment.shift.end_time)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
