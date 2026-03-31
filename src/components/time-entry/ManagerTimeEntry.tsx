"use client";

import type { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import dayjs from "dayjs";
import { ArrowRight, Download, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { formatDuration } from "@/lib/utils";
import { authHeaders } from "@/utils/auth";

interface EmployeeSummary {
  employee: {
    id: number;
    name: string;
    email: string | null;
  };
  total_minutes: number;
  entry_count: number;
  last_clocked_in_at: string | null;
}

export default function ManagerTimeEntry() {
  const [data, setData] = useState<EmployeeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<Date | undefined>(dayjs().startOf("month").toDate());
  const [to, setTo] = useState<Date | undefined>(dayjs().endOf("month").toDate());

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (from) params.from = dayjs(from).format("YYYY-MM-DD");
    if (to) params.to = dayjs(to).format("YYYY-MM-DD");

    axios
      .get("/api/manager/clock-entries/summary", {
        headers: authHeaders(),
        params,
      })
      .then((res) => setData(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to]);

  const handleExport = useCallback(
    async (employeeId?: number) => {
      const params = new URLSearchParams();
      if (from) params.set("from", dayjs(from).format("YYYY-MM-DD"));
      if (to) params.set("to", dayjs(to).format("YYYY-MM-DD"));
      if (employeeId) params.set("employee_id", String(employeeId));

      try {
        const response = await axios.get(`/api/manager/clock-entries/export?${params.toString()}`, {
          headers: authHeaders(),
          responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = `timaskraning_${dayjs().format("YYYY-MM-DD")}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch {
        toast.error("Villa við að sækja Excel skjal");
      }
    },
    [from, to],
  );

  const columns: ColumnDef<EmployeeSummary>[] = useMemo(
    () => [
      {
        accessorKey: "employee.name",
        header: "Starfsmaður",
        cell: ({ row }) => <span className="font-medium">{row.original.employee.name}</span>,
      },
      {
        accessorKey: "employee.email",
        header: "Netfang",
        cell: ({ row }) => row.original.employee.email ?? "–",
      },
      {
        accessorKey: "total_minutes",
        header: "Heildartímar",
        cell: ({ row }) => formatDuration(row.original.total_minutes, "minutes"),
      },
      {
        accessorKey: "entry_count",
        header: "Fjöldi færslna",
      },
      {
        accessorKey: "last_clocked_in_at",
        header: "Síðasta innstimplun",
        cell: ({ row }) =>
          row.original.last_clocked_in_at ? dayjs(row.original.last_clocked_in_at).format("D. MMM YYYY HH:mm") : "–",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const employeeId = row.original.employee.id;
          return (
            <div className="flex items-center justify-end gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Opna valmynd</span>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-max">
                  <DropdownMenuItem render={<Link href={`/dashboard/time-entry/${employeeId}`} />}>
                    Skoða
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(employeeId)}>
                    <Download className="size-4" />
                    Sækja sem Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                href={`/dashboard/time-entry/${employeeId}`}
                className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
              >
                <ArrowRight className="size-4" />
              </Link>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl/9 font-bold tracking-tight">Tímaskráning</h1>
          <p className="mt-2 text-sm/6 text-muted-foreground">
            Sjáðu yfirlit yfir hvenær og hvar starfsfólk er að klukka sig inn/út.
          </p>
        </div>
        <Button type="button" size="lg" onClick={() => handleExport()}>
          <Download className="mr-0.5" />
          Sækja sem Excel
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="w-56">
          <DatePicker
            value={from}
            onChange={(date) => {
              setFrom(date);
              if (date && (!to || dayjs(date).isAfter(to))) {
                setTo(dayjs(date).add(30, "day").toDate());
              }
            }}
            placeholder="Frá dagsetningu"
          />
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
          <DataTable columns={columns} data={data} />
        )}
      </div>
    </>
  );
}
