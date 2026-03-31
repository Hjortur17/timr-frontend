"use client";

import type { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/context/UserContext";
import { formatDuration } from "@/lib/utils";
import type { ClockEntry } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

interface EmployeeInfo {
  id: number;
  name: string;
  email: string | null;
}

export default function EmployeeTimeEntryDetailPage() {
  const { isManager } = useUser();
  const router = useRouter();
  const params = useParams<{ employeeId: string }>();
  const employeeId = params.employeeId;

  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<Date | undefined>(dayjs().startOf("month").toDate());
  const [to, setTo] = useState<Date | undefined>(dayjs().endOf("month").toDate());

  useEffect(() => {
    if (!isManager) {
      router.replace("/dashboard/time-entry");
      return;
    }
  }, [isManager, router]);

  useEffect(() => {
    if (!isManager) return;

    setLoading(true);
    const queryParams: Record<string, string> = { employee_id: employeeId };
    if (from) queryParams.from = dayjs(from).format("YYYY-MM-DD");
    if (to) queryParams.to = dayjs(to).format("YYYY-MM-DD");

    axios
      .get("/api/manager/clock-entries", { headers: authHeaders(), params: queryParams })
      .then((res) => {
        const data = res.data.data ?? [];
        setEntries(data);
        if (data.length > 0 && data[0].employee) {
          setEmployee(data[0].employee);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isManager, employeeId, from, to]);

  const totalMinutes = useMemo(() => {
    return entries.reduce((sum, entry) => sum + (entry.total_minutes ?? 0), 0);
  }, [entries]);

  const formattedTotal = useMemo(() => formatDuration(totalMinutes, "minutes"), [totalMinutes]);

  const columns: ColumnDef<ClockEntry>[] = useMemo(
    () => [
      {
        accessorKey: "clocked_in_at",
        header: "Dagsetning",
        cell: ({ row }) => dayjs(row.original.clocked_in_at).format("ddd D. MMM YYYY"),
      },
      {
        id: "clock_in_time",
        header: "Inn",
        cell: ({ row }) => dayjs(row.original.clocked_in_at).format("HH:mm"),
      },
      {
        id: "clock_out_time",
        header: "Út",
        cell: ({ row }) => (row.original.clocked_out_at ? dayjs(row.original.clocked_out_at).format("HH:mm") : "–"),
      },
      {
        accessorKey: "total_minutes",
        header: "Heildartími",
        cell: ({ row }) =>
          row.original.total_minutes != null ? formatDuration(row.original.total_minutes, "minutes") : "–",
      },
      {
        accessorKey: "shift.title",
        header: "Vakt",
        cell: ({ row }) =>
          row.original.is_extra ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Auka
            </span>
          ) : (
            (row.original.shift?.title ?? "–")
          ),
      },
    ],
    [],
  );

  if (!isManager) return null;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard/time-entry" />}>Tímaskráning</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{employee?.name ?? "Starfsmaður"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-4">
        <h1 className="text-2xl/9 font-bold tracking-tight">{employee?.name ?? "Starfsmaður"}</h1>
        {employee?.email && <p className="mt-1 text-sm text-muted-foreground">{employee.email}</p>}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="w-56">
          <DatePicker value={from} onChange={setFrom} placeholder="Frá dagsetningu" />
        </div>
        <div className="w-56">
          <DatePicker value={to} onChange={setTo} placeholder="Til dagsetningar" />
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
                  Samtals: <span className="text-primary">{formattedTotal}</span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
