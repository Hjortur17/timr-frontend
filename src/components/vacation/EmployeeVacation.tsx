"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Dialog from "@/components/Dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { VacationBalance, VacationRequest, VacationRequestForm, VacationRequestStatus } from "@/types/forms";
import { vacationRequestFormSchema } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

const STATUS_COLORS: Record<VacationRequestStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  approved: "bg-green-50 text-green-700 ring-green-600/20",
  denied: "bg-red-50 text-red-700 ring-red-600/20",
  cancelled: "bg-neutral-50 text-neutral-600 ring-neutral-500/10",
};

export default function EmployeeVacation() {
  const t = useTranslations();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [balance, setBalance] = useState<VacationBalance | null>(null);
  const [openCreateSheet, setOpenCreateSheet] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<VacationRequest | null>(null);

  useEffect(() => {
    axios
      .get("/api/employee/vacation-requests", { headers: authHeaders() })
      .then((res) => setRequests(res.data.data ?? []))
      .catch(console.error);

    axios
      .get("/api/employee/vacation-balance", { headers: authHeaders() })
      .then((res) => setBalance(res.data.data))
      .catch(console.error);
  }, []);

  const onCreated = (request: VacationRequest) => {
    setRequests((prev) => [request, ...prev]);
    setFormKey((k) => k + 1);
    setOpenCreateSheet(false);

    // Refresh balance
    axios
      .get("/api/employee/vacation-balance", { headers: authHeaders() })
      .then((res) => setBalance(res.data.data))
      .catch(console.error);
  };

  const cancelRequest = async (request: VacationRequest) => {
    try {
      const res = await axios.post(`/api/employee/vacation-requests/${request.id}/cancel`, {}, { headers: authHeaders() });
      setRequests((prev) => prev.map((r) => (r.id === request.id ? res.data.data : r)));
      setShowCancelDialog(false);
      setCancelTarget(null);
      toast.success(t("vacation.requestCancelled"));

      // Refresh balance
      axios
        .get("/api/employee/vacation-balance", { headers: authHeaders() })
        .then((res) => setBalance(res.data.data))
        .catch(console.error);
    } catch {
      toast.error(t("vacation.requestError"));
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("is-IS", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <>
      <div className="sm:mx-auto sm:w-full flex items-end justify-between">
        <div>
          <h1 className="text-2xl/9 font-bold tracking-tight text-neutral-900">{t("vacation.title")}</h1>
          <p className="mt-2 text-sm/6 text-neutral-500">{t("vacation.employeeDescription")}</p>
        </div>

        <Button type="button" size="lg" onClick={() => setOpenCreateSheet(true)}>
          {t("vacation.requestVacation")}
        </Button>
      </div>

      {/* Balance Cards */}
      {balance && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <BalanceCard label={t("vacation.entitled")} value={balance.entitled} unit={t("vacation.days")} />
          <BalanceCard label={t("vacation.used")} value={balance.used} unit={t("vacation.days")} />
          <BalanceCard label={t("vacation.pendingDays")} value={balance.pending} unit={t("vacation.days")} />
          <BalanceCard
            label={t("vacation.remaining")}
            value={balance.remaining}
            unit={t("vacation.days")}
            highlight
          />
        </div>
      )}

      {/* Requests List */}
      <div className="sm:mx-auto sm:w-full">
        <div className="mt-8 flow-root">
          <div className="-my-2 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              {requests.length === 0 ? (
                <p className="text-sm text-neutral-500 py-8 text-center">{t("vacation.noRequests")}</p>
              ) : (
                <table className="relative min-w-full divide-y divide-neutral-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-neutral-900 sm:pl-3">
                        {t("vacation.startDate")}
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">
                        {t("vacation.endDate")}
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">
                        {t("vacation.workingDays")}
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">
                        {t("vacation.status")}
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">
                        {t("vacation.note")}
                      </th>
                      <th className="py-3.5 pr-4 pl-3 sm:pr-3">
                        <span className="sr-only">{t("common.actions")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {requests.map((request) => (
                      <tr key={request.id} className="even:bg-foreground-light">
                        <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-neutral-900 sm:pl-3">
                          {formatDate(request.start_date)}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-neutral-500">
                          {formatDate(request.end_date)}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-neutral-500">
                          {request.working_days_count} {t("vacation.days")}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[request.status]}`}
                          >
                            {t(`vacation.${request.status}`)}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-neutral-500 max-w-48 truncate">
                          {request.employee_note || "–"}
                        </td>
                        <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-3">
                          {request.status === "pending" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setCancelTarget(request);
                                setShowCancelDialog(true);
                              }}
                            >
                              {t("vacation.cancel")}
                            </Button>
                          )}
                          {request.reviewer_note && request.status !== "pending" && (
                            <span className="text-xs text-neutral-400" title={request.reviewer_note}>
                              {request.reviewer_note}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Sheet */}
      <Sheet open={openCreateSheet} onOpenChange={(value) => !value && setOpenCreateSheet(false)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("vacation.requestVacation")}</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <CreateVacationRequestForm key={formKey} onCreated={onCreated} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setCancelTarget(null);
        }}
        variant="warning"
        title={t("vacation.cancel")}
        description={t("vacation.cancelConfirm")}
        onConfirm={() => cancelTarget && cancelRequest(cancelTarget)}
        onCancel={() => {
          setShowCancelDialog(false);
          setCancelTarget(null);
        }}
        buttonTextConfirm={t("vacation.cancel")}
        buttonTextCancel={t("common.cancel")}
      />
    </>
  );
}

function BalanceCard({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${highlight ? "border-primary/30 bg-primary/5" : "border-neutral-200 bg-white"}`}
    >
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : "text-neutral-900"}`}>
        {value} <span className="text-sm font-normal text-neutral-400">{unit}</span>
      </p>
    </div>
  );
}

function CreateVacationRequestForm({ onCreated }: { onCreated: (request: VacationRequest) => void }) {
  const t = useTranslations();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VacationRequestForm>({
    resolver: zodResolver(vacationRequestFormSchema),
    defaultValues: { start_date: "", end_date: "", note: "" },
  });

  const onSubmit = async (data: VacationRequestForm) => {
    try {
      const response = await axios.post("/api/employee/vacation-requests", data, { headers: authHeaders() });
      onCreated(response.data.data);
      toast.success(t("vacation.requestCreated"));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? t("vacation.requestError"));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="start_date" className="block text-base/7 font-semibold text-neutral-950">
          {t("vacation.startDate")}
        </label>
        <div className="mt-2">
          <Input id="start_date" type="date" {...register("start_date")} />
        </div>
        {errors.start_date && <p className="mt-1 text-sm text-destructive">{errors.start_date.message}</p>}
      </div>

      <div>
        <label htmlFor="end_date" className="block text-base/7 font-semibold text-neutral-950">
          {t("vacation.endDate")}
        </label>
        <div className="mt-2">
          <Input id="end_date" type="date" {...register("end_date")} />
        </div>
        {errors.end_date && <p className="mt-1 text-sm text-destructive">{errors.end_date.message}</p>}
      </div>

      <div>
        <label htmlFor="note" className="block text-base/7 font-semibold text-neutral-950">
          {t("vacation.note")}
        </label>
        <div className="mt-2">
          <Input id="note" type="text" placeholder={t("vacation.notePlaceholder")} {...register("note")} />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full">
        {t("vacation.requestVacation")}
      </Button>
    </form>
  );
}
