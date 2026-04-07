"use client";

import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/utils";
import type { ShiftAssignment } from "@/types/forms";
import { authHeaders } from "@/utils/auth";
import { cn } from "@/utils/classname";

dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);


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

interface CalendarDay {
  date: dayjs.Dayjs;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

function getCalendarDays(month: dayjs.Dayjs, today: dayjs.Dayjs): CalendarDay[] {
  const startOfMonth = month.startOf("month");
  const endOfMonth = month.endOf("month");
  const calendarStart = startOfMonth.startOf("isoWeek");
  const calendarEnd = endOfMonth.endOf("isoWeek");

  const days: CalendarDay[] = [];
  let current = calendarStart;
  while (current.isBefore(calendarEnd, "day") || current.isSame(calendarEnd, "day")) {
    days.push({
      date: current,
      dateStr: current.format("YYYY-MM-DD"),
      isCurrentMonth: current.month() === month.month(),
      isToday: current.isSame(today, "day"),
    });
    current = current.add(1, "day");
  }
  return days;
}

export default function EmployeeWeeklyCalendar() {
  const t = useTranslations();
  const dayLabels = t.raw("calendar.dayLabels") as string[];
  const durationLabels = { hours: t("common.hoursAbbr"), minutes: t("common.minutesAbbr") };
  const [currentMonth, setCurrentMonth] = useState(() => dayjs().startOf("month"));
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));

  const today = dayjs();
  const calendarDays = useMemo(() => getCalendarDays(currentMonth, today), [currentMonth, today]);
  const rowCount = calendarDays.length / 7;

  const calendarStart = calendarDays[0].dateStr;
  const calendarEnd = calendarDays[calendarDays.length - 1].dateStr;

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/employee/shifts?from=${calendarStart}&to=${calendarEnd}`, {
        headers: authHeaders(),
      })
      .then((res) => setAssignments(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [calendarStart, calendarEnd]);

  const assignmentsByDate = useMemo(() => {
    const map = new Map<string, ShiftAssignment[]>();
    for (const a of assignments) {
      const key = a.date;
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    return map;
  }, [assignments]);

  const totalMonthMinutes = useMemo(() => {
    return assignments
      .filter((a) => dayjs(a.date).month() === currentMonth.month())
      .reduce((sum, a) => sum + durationMinutes(a.shift.start_time, a.shift.end_time), 0);
  }, [assignments, currentMonth]);

  const isCurrentMonth = today.month() === currentMonth.month() && today.year() === currentMonth.year();

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));
  const goToday = () => {
    setCurrentMonth(dayjs().startOf("month"));
    setSelectedDate(dayjs().format("YYYY-MM-DD"));
  };

  const selectedAssignments = assignmentsByDate.get(selectedDate) ?? [];

  if (loading) {
    return (
      <div className="mt-6 flex flex-col lg:h-full">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
        <div className="ring-1 ring-border shadow-sm lg:flex lg:flex-auto lg:flex-col">
          <div className="grid grid-cols-7 gap-px bg-muted text-center">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="bg-background py-2">
                <Skeleton className="mx-auto h-4 w-8" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-muted lg:flex-auto lg:grid-rows-6">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="bg-background p-3 lg:min-h-[5.5rem]">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="mt-2 hidden h-3 w-3/4 lg:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col lg:h-full">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-0 py-4 lg:flex-none">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-semibold text-foreground capitalize min-w-34">
            <time dateTime={currentMonth.format("YYYY-MM")}>{currentMonth.format("MMMM YYYY")}</time>
          </h1>

          <div className="flex items-center ">
            <Button variant="ghost" size="icon-sm" onClick={prevMonth} className="rounded-r-none">
              <span className="sr-only">{t("calendar.previousMonth")}</span>
              <ChevronLeft className="size-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={nextMonth} className="rounded-l-none">
              <span className="sr-only">{t("calendar.nextMonth")}</span>
              <ChevronRight className="size-5" />
            </Button>
          </div>

          {!isCurrentMonth && (
            <Button variant="ghost" size="sm" onClick={goToday} className="hidden px-3.5 md:block">
              {t("common.today")}
            </Button>
          )}
        </div>
        <div className="flex items-center">
          {totalMonthMinutes > 0 && (
            <span className="ml-4 hidden text-sm text-muted-foreground md:block">
              {formatDuration(totalMonthMinutes, "minutes", durationLabels)}
            </span>
          )}
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="shadow-sm ring-1 ring-border lg:flex lg:flex-auto lg:flex-col">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-px border-b border-border bg-muted text-center text-xs/6 font-semibold text-muted-foreground lg:flex-none">
          {dayLabels.map((label) => (
            <div key={label} className="flex justify-center bg-background py-2">
              <span>{label.charAt(0)}</span>
              <span className="sr-only sm:not-sr-only">{label.slice(1)}</span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="flex bg-muted text-xs/6 text-muted-foreground lg:flex-auto">
          {/* Desktop grid */}
          <div
            className="hidden w-full lg:grid lg:grid-cols-7 lg:gap-px"
            style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))` }}
          >
            {calendarDays.map((day) => {
              const dayAssignments = assignmentsByDate.get(day.dateStr) ?? [];
              return (
                <div
                  key={day.dateStr}
                  className={cn(
                    "group relative min-h-[5.5rem] px-3 py-2",
                    day.isCurrentMonth ? "bg-background" : "bg-muted/50 text-muted-foreground",
                  )}
                >
                  <time
                    dateTime={day.dateStr}
                    className={cn(
                      day.isToday &&
                        "flex size-6 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
                      !day.isCurrentMonth && "opacity-50",
                    )}
                  >
                    {day.date.date()}
                  </time>
                  {dayAssignments.length > 0 && (
                    <ol className="mt-2">
                      {dayAssignments.slice(0, 2).map((assignment) => {
                        const color = getShiftColor(assignment.shift.title);
                        return (
                          <li key={assignment.id} className="flex items-center gap-1.5">
                            <span className={cn("size-1.5 shrink-0 rounded-full", color.bg)} />
                            <p className="flex-auto truncate font-medium text-foreground">{assignment.shift.title}</p>
                            <time
                              dateTime={`${day.dateStr}T${assignment.shift.start_time}`}
                              className="ml-3 hidden flex-none text-muted-foreground xl:block"
                            >
                              {formatShiftTime(assignment.shift.start_time)}
                            </time>
                          </li>
                        );
                      })}
                      {dayAssignments.length > 2 && (
                        <li className="text-muted-foreground">
                          + {dayAssignments.length - 2} {t("calendar.moreShifts")}
                        </li>
                      )}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile grid */}
          <div
            className="isolate grid w-full grid-cols-7 gap-px lg:hidden"
            style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))` }}
          >
            {calendarDays.map((day) => {
              const dayAssignments = assignmentsByDate.get(day.dateStr) ?? [];
              const isSelected = selectedDate === day.dateStr;
              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={cn(
                    "group relative flex h-14 flex-col bg-background px-3 py-2 hover:bg-muted focus:z-10",
                    !day.isCurrentMonth && "bg-muted/50",
                    isSelected && "font-semibold",
                    day.isToday && "font-semibold",
                    !isSelected && day.isToday && "text-primary",
                    !isSelected && day.isCurrentMonth && !day.isToday && "text-foreground",
                    !isSelected && !day.isCurrentMonth && !day.isToday && "text-muted-foreground",
                  )}
                >
                  <time
                    dateTime={day.dateStr}
                    className={cn(
                      "ml-auto",
                      !day.isCurrentMonth && "opacity-50",
                      isSelected && "flex size-6 items-center justify-center rounded-full",
                      isSelected && day.isToday && "bg-primary text-primary-foreground",
                      isSelected && !day.isToday && "bg-foreground text-background",
                    )}
                  >
                    {day.date.date()}
                  </time>
                  <span className="sr-only">
                    {dayAssignments.length} {t("calendar.shiftsCount")}
                  </span>
                  {dayAssignments.length > 0 && (
                    <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                      {dayAssignments.map((a) => (
                        <span
                          key={a.id}
                          className={cn("mx-0.5 mb-1 size-1.5 rounded-full", getShiftColor(a.shift.title).bg)}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: Selected Day Detail Panel */}
      <div className="relative px-4 py-10 sm:px-6 lg:hidden">
        <ol className="divide-y divide-border overflow-hidden rounded-lg bg-background text-sm shadow-sm ring-1 ring-border">
          {selectedAssignments.length === 0 ? (
            <li className="p-4 text-center text-muted-foreground">{t("calendar.noShiftsOnDay")}</li>
          ) : (
            selectedAssignments.map((a) => {
              const color = getShiftColor(a.shift.title);
              return (
                <li key={a.id} className="group flex p-4 pr-6 hover:bg-muted">
                  <div className="flex-auto">
                    <p className="font-semibold text-foreground">{a.shift.title}</p>
                    <time
                      dateTime={`${a.date}T${a.shift.start_time}`}
                      className="mt-2 flex items-center text-muted-foreground"
                    >
                      <Clock aria-hidden="true" className="mr-2 size-5 text-muted-foreground/70" />
                      {formatShiftTime(a.shift.start_time)}–{formatShiftTime(a.shift.end_time)}
                    </time>
                  </div>
                </li>
              );
            })
          )}
        </ol>
      </div>
    </div>
  );
}
