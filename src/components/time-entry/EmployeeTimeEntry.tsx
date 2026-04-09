"use client";

import type { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { Spinner } from "@/components/ui/spinner";
import { formatDuration } from "@/lib/utils";
import type { ClockEntry } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

export default function EmployeeTimeEntry() {
  const t = useTranslations();
  const durationLabels = { hours: t("common.hoursAbbr"), minutes: t("common.minutesAbbr") };
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<Date | undefined>(dayjs().startOf("month").toDate());
  const [to, setTo] = useState<Date | undefined>(dayjs().endOf("month").toDate());

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (from) params.from = dayjs(from).format("YYYY-MM-DD");
    if (to) params.to = dayjs(to).format("YYYY-MM-DD");

    axios
      .get("/api/employee/clock-entries", { headers: authHeaders(), params })
      .then((res) => setEntries(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to]);

  const totalMinutes = useMemo(() => {
    return entries.reduce((sum, entry) => sum + (entry.total_minutes ?? 0), 0);
  }, [entries]);

  const formattedTotal = useMemo(
    () => formatDuration(totalMinutes, "minutes", durationLabels),
    [totalMinutes, durationLabels],
  );

  const columns: ColumnDef<ClockEntry>[] = useMemo(
    () => [
      {
        accessorKey: "clocked_in_at",
        header: t("timeEntry.date"),
        cell: ({ row }) => dayjs(row.original.clocked_in_at).format("ddd D. MMM YYYY"),
      },
      {
        id: "clock_in_time",
        header: t("timeEntry.clockInTime"),
        cell: ({ row }) => dayjs(row.original.clocked_in_at).format("HH:mm"),
      },
      {
        id: "clock_out_time",
        header: t("timeEntry.clockOutTime"),
        cell: ({ row }) => (row.original.clocked_out_at ? dayjs(row.original.clocked_out_at).format("HH:mm") : "–"),
      },
      {
        accessorKey: "total_minutes",
        header: t("timeEntry.totalTime"),
        cell: ({ row }) =>
          row.original.total_minutes != null
            ? formatDuration(row.original.total_minutes, "minutes", durationLabels)
            : "–",
      },
      {
        accessorKey: "shift.title",
        header: t("timeEntry.shift"),
        cell: ({ row }) =>
          row.original.is_extra ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {t("timeEntry.extra")}
            </span>
          ) : (
            (row.original.shift?.title ?? "–")
          ),
      },
    ],
    [t],
  );

  return (
    <>
      <div>
        <h1 className="text-2xl/9 font-bold tracking-tight">{t("timeEntry.title")}</h1>
        <p className="mt-2 text-sm/6 text-muted-foreground">{t("timeEntry.employeeDescription")}</p>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="w-56">
          <DatePicker value={from} onChange={setFrom} placeholder={t("timeEntry.fromDate")} />
        </div>
        <div className="w-56">
          <DatePicker value={to} onChange={setTo} placeholder={t("timeEntry.toDate")} />
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={entries} />
            {entries.length > 0 && (
              <div className="mt-4 flex justify-end border-t pt-4">
                <p className="text-sm font-semibold">
                  {t("timeEntry.total")}: <span className="text-primary">{formattedTotal}</span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
