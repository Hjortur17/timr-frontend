"use client";

import type { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import dayjs from "dayjs";
import { Check, Download, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { TimeInput } from "@/components/ui/time-input";
import { useUser } from "@/context/UserContext";
import { formatDuration } from "@/lib/utils";
import type { ClockEntry } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

interface EmployeeInfo {
  id: number;
  name: string;
  email: string | null;
}

interface EditForm {
  date: Date;
  inTime: string;
  outTime: string;
}

export default function EmployeeTimeEntryDetailPage() {
  const t = useTranslations();
  const durationLabels = { hours: t("common.hoursAbbr"), minutes: t("common.minutesAbbr") };
  const { isManager } = useUser();
  const router = useRouter();
  const params = useParams<{ employeeId: string }>();
  const searchParams = useSearchParams();
  const employeeId = params.employeeId;

  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState<Date | undefined>(
    searchParams.get("from") ? dayjs(searchParams.get("from")).toDate() : dayjs().startOf("month").toDate(),
  );
  const [to, setTo] = useState<Date | undefined>(
    searchParams.get("to") ? dayjs(searchParams.get("to")).toDate() : dayjs().endOf("month").toDate(),
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ date: new Date(), inTime: "", outTime: "" });
  const editFormRef = useRef(editForm);
  editFormRef.current = editForm;
  const [saving, setSaving] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [openCreateSheet, setOpenCreateSheet] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);

  const filterActive =
    !dayjs(from).isSame(dayjs().startOf("month"), "day") || !dayjs(to).isSame(dayjs().endOf("month"), "day");

  const resetFilter = () => {
    setFrom(dayjs().startOf("month").toDate());
    setTo(dayjs().endOf("month").toDate());
  };

  const handleExport = useCallback(async () => {
    const exportParams = new URLSearchParams();
    if (from) exportParams.set("from", dayjs(from).format("YYYY-MM-DD"));
    if (to) exportParams.set("to", dayjs(to).format("YYYY-MM-DD"));
    exportParams.set("employee_id", employeeId);

    try {
      const response = await axios.get(`/api/manager/clock-entries/export?${exportParams.toString()}`, {
        headers: authHeaders(),
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `timaskraning_${employee?.name ?? employeeId}_${dayjs().format("YYYY-MM-DD")}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Villa við að sækja Excel skjal");
    }
  }, [from, to, employeeId, employee?.name]);

  const startEdit = (entry: ClockEntry) => {
    setEditingId(entry.id);
    setEditForm({
      date: dayjs(entry.clocked_in_at).toDate(),
      inTime: dayjs(entry.clocked_in_at).format("HH:mm"),
      outTime: entry.clocked_out_at ? dayjs(entry.clocked_out_at).format("HH:mm") : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);

    const dateStr = dayjs(editFormRef.current.date).format("YYYY-MM-DD");
    const body: Record<string, string | null> = {
      clocked_in_at: `${dateStr} ${editFormRef.current.inTime}:00`,
    };
    if (editFormRef.current.outTime) {
      body.clocked_out_at = `${dateStr} ${editFormRef.current.outTime}:00`;
    } else {
      body.clocked_out_at = null;
    }

    try {
      const res = await axios.put(`/api/manager/clock-entries/${editingId}`, body, {
        headers: authHeaders(),
      });
      const updated: ClockEntry = res.data.data;
      setEntries((prev) => prev.map((e) => (e.id === editingId ? updated : e)));
      setEditingId(null);
      toast.success("Skráning uppfærð");
    } catch {
      toast.error("Villa við að uppfæra skráningu");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);

    try {
      await axios.delete(`/api/manager/clock-entries/${deleteTargetId}`, {
        headers: authHeaders(),
      });
      setEntries((prev) => prev.filter((e) => e.id !== deleteTargetId));
      setDeleteTargetId(null);
      toast.success("Skráning eytt");
    } catch {
      toast.error("Villa við að eyða skráningu");
    } finally {
      setDeleting(false);
    }
  };

  const onCreated = (entry: ClockEntry) => {
    setEntries((prev) => [entry, ...prev]);
    setOpenCreateSheet(false);
    setCreateFormKey((k) => k + 1);
  };

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

  const formattedTotal = useMemo(() => formatDuration(totalMinutes, "minutes", durationLabels), [totalMinutes, durationLabels]);

  const columns: ColumnDef<ClockEntry>[] = useMemo(
    () => [
      {
        accessorKey: "clocked_in_at",
        header: "Dagsetning",
        size: 220,
        cell: ({ row }) => {
          if (editingId === row.original.id) {
            return (
              <DatePicker
                value={editFormRef.current.date}
                onChange={(d) => d && setEditForm((f) => ({ ...f, date: d }))}
              />
            );
          }
          return dayjs(row.original.clocked_in_at).format("ddd D. MMM YYYY");
        },
      },
      {
        id: "clock_in_time",
        header: "Inn",
        size: 100,
        cell: ({ row }) => {
          if (editingId === row.original.id) {
            return (
              <TimeInput
                value={editFormRef.current.inTime}
                onChange={(e) => setEditForm((f) => ({ ...f, inTime: e.target.value }))}
              />
            );
          }
          return dayjs(row.original.clocked_in_at).format("HH:mm");
        },
      },
      {
        id: "clock_out_time",
        header: "Út",
        size: 100,
        cell: ({ row }) => {
          if (editingId === row.original.id) {
            return (
              <TimeInput
                value={editFormRef.current.outTime}
                onChange={(e) => setEditForm((f) => ({ ...f, outTime: e.target.value }))}
              />
            );
          }
          return row.original.clocked_out_at ? dayjs(row.original.clocked_out_at).format("HH:mm") : "–";
        },
      },
      {
        accessorKey: "total_minutes",
        header: "Heildartími",
        size: 140,
        cell: ({ row }) =>
          row.original.total_minutes != null ? formatDuration(row.original.total_minutes, "minutes", durationLabels) : "–",
      },
      {
        accessorKey: "shift.title",
        header: "Vakt",
        size: 120,
        cell: ({ row }) =>
          row.original.is_extra ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Auka
            </span>
          ) : (
            (row.original.shift?.title ?? "–")
          ),
      },
      {
        id: "actions",
        header: "",
        size: 90,
        cell: ({ row }) => {
          const entry = row.original;
          if (editingId === entry.id) {
            return (
              <div className="flex items-center justify-end gap-1">
                <Button type="button" variant="ghost" size="icon-sm" onClick={saveEdit} disabled={saving}>
                  <Check className="size-4" />
                  <span className="sr-only">Vista</span>
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={cancelEdit} disabled={saving}>
                  <X className="size-4" />
                  <span className="sr-only">Hætta við</span>
                </Button>
              </div>
            );
          }
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => startEdit(entry)}
                disabled={editingId !== null}
              >
                <Pencil className="size-4" />
                <span className="sr-only">Breyta</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleteTargetId(entry.id)}
                disabled={editingId !== null}
              >
                <Trash2 className="size-4 text-destructive" />
                <span className="sr-only">Eyða</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [editingId, saving],
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

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl/9 font-bold tracking-tight">{employee?.name ?? "Starfsmaður"}</h1>
          {employee?.email && <p className="mt-1 text-sm text-muted-foreground">{employee.email}</p>}
        </div>
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
              <DropdownMenuItem onClick={handleExport}>
                <Download className="size-4" />
                Sækja sem Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" size="lg" onClick={() => setOpenCreateSheet(true)}>
            Bæta við skráningu
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="w-56">
          <DatePicker value={from} onChange={setFrom} placeholder="Frá dagsetningu" />
        </div>
        <div className="w-56">
          <DatePicker value={to} onChange={setTo} placeholder="Til dagsetningar" />
        </div>
        {filterActive && (
          <Button type="button" variant="ghost" size="sm" onClick={resetFilter}>
            <X className="mr-1 size-4" />
            Hreinsa
          </Button>
        )}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={entries} fixedLayout />
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

      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Eyða skráningu?</AlertDialogTitle>
            <AlertDialogDescription>
              Þessi aðgerð er ekki afturkræf. Skráningin verður fjarlægð úr yfirlitinu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hætta við</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={deleting}>
              Eyða
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={openCreateSheet} onOpenChange={(open) => !open && setOpenCreateSheet(false)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Bæta við skráningu</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <CreateClockEntryForm key={createFormKey} employeeId={employeeId} onCreated={onCreated} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CreateClockEntryForm({
  employeeId,
  onCreated,
}: {
  employeeId: string;
  onCreated: (entry: ClockEntry) => void;
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isToday = dayjs(date).isSame(dayjs(), "day");
  const canSubmit = inTime.length === 5 && !submitting && (isToday || outTime.length === 5);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const body: Record<string, string | number> = {
      employee_id: Number(employeeId),
      clocked_in_at: `${dateStr} ${inTime}:00`,
    };
    if (outTime) {
      body.clocked_out_at = `${dateStr} ${outTime}:00`;
    }

    try {
      const res = await axios.post("/api/manager/clock-entries", body, {
        headers: authHeaders(),
      });
      onCreated(res.data.data);
      toast.success("Skráning bætt við");
    } catch {
      toast.error("Villa við að bæta við skráningu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
    >
      <div>
        <label className="block text-base/7 font-semibold">Dagsetning</label>
        <div className="mt-2">
          <DatePicker value={date} onChange={(d) => d && setDate(d)} disabled={{ after: new Date() }} />
        </div>
      </div>
      <div>
        <label className="block text-base/7 font-semibold">Inn</label>
        <div className="mt-2">
          <TimeInput value={inTime} onChange={(e) => setInTime(e.target.value)} placeholder="08:00" />
        </div>
      </div>
      <div>
        <label className="block text-base/7 font-semibold">Út{isToday ? " (valfrjálst)" : ""}</label>
        <div className="mt-2">
          <TimeInput value={outTime} onChange={(e) => setOutTime(e.target.value)} placeholder="16:00" />
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
        {submitting ? <Spinner className="size-4" /> : "Bæta við skráningu"}
      </Button>
    </form>
  );
}
