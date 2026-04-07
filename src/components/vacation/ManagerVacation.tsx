"use client";

import axios from "axios";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { VacationRequest, VacationRequestStatus } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

const STATUS_COLORS: Record<VacationRequestStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  approved: "bg-green-50 text-green-700 ring-green-600/20",
  denied: "bg-red-50 text-red-700 ring-red-600/20",
  cancelled: "bg-neutral-50 text-neutral-600 ring-neutral-500/10",
};

export default function ManagerVacation() {
  const t = useTranslations();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [showReviewSheet, setShowReviewSheet] = useState(false);

  const fetchRequests = (status?: string) => {
    const params = status ? `?status=${status}` : "";
    axios
      .get(`/api/manager/vacation-requests${params}`, { headers: authHeaders() })
      .then((res) => setRequests(res.data.data ?? []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchRequests(statusFilter || undefined);
  }, [statusFilter]);

  const reviewRequest = async (id: number, status: "approved" | "denied") => {
    try {
      const res = await axios.post(
        `/api/manager/vacation-requests/${id}/review`,
        { status, note: reviewNote || undefined },
        { headers: authHeaders() },
      );

      setRequests((prev) => prev.map((r) => (r.id === id ? res.data.data : r)));
      setShowReviewSheet(false);
      setSelectedRequest(null);
      setReviewNote("");

      toast.success(status === "approved" ? t("vacation.requestApproved") : t("vacation.requestDenied"));
    } catch {
      toast.error(t("vacation.requestError"));
    }
  };

  const openReview = (request: VacationRequest) => {
    setSelectedRequest(request);
    setReviewNote("");
    setShowReviewSheet(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("is-IS", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <>
      <div className="sm:mx-auto sm:w-full flex items-end justify-between">
        <div>
          <h1 className="text-2xl/9 font-bold tracking-tight text-neutral-900">{t("vacation.title")}</h1>
          <p className="mt-2 text-sm/6 text-neutral-500">{t("vacation.managerDescription")}</p>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t("vacation.allStatuses")}</option>
            <option value="pending">{t("vacation.pending")}</option>
            <option value="approved">{t("vacation.approved")}</option>
            <option value="denied">{t("vacation.denied")}</option>
            <option value="cancelled">{t("vacation.cancelled")}</option>
          </select>
        </div>
      </div>

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
                        {t("vacation.employee")}
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-neutral-900">
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
                      <th className="py-3.5 pr-4 pl-3 sm:pr-3">
                        <span className="sr-only">{t("common.actions")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {requests.map((request) => (
                      <tr key={request.id} className="even:bg-foreground-light">
                        <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-neutral-900 sm:pl-3">
                          {request.employee?.name ?? "–"}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-neutral-500">
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
                        <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-3">
                          {request.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-green-700 hover:text-green-800 hover:bg-green-50"
                                onClick={() => openReview(request)}
                              >
                                <Check className="size-4 mr-1" />
                                {t("vacation.approve")}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-700 hover:text-red-800 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setReviewNote("");
                                  reviewRequest(request.id, "denied");
                                }}
                              >
                                <X className="size-4 mr-1" />
                                {t("vacation.deny")}
                              </Button>
                            </div>
                          )}
                          {request.status !== "pending" && request.reviewer && (
                            <span className="text-xs text-neutral-400">
                              {t("vacation.reviewedBy")}: {request.reviewer.name}
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

      <Sheet open={showReviewSheet} onOpenChange={(value) => !value && setShowReviewSheet(false)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("vacation.approve")}</SheetTitle>
          </SheetHeader>
          {selectedRequest && (
            <div className="px-4 space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">
                  <span className="font-medium text-neutral-900">{selectedRequest.employee?.name}</span>
                </p>
                <p className="text-sm text-neutral-500">
                  {formatDate(selectedRequest.start_date)} — {formatDate(selectedRequest.end_date)}
                </p>
                <p className="text-sm text-neutral-500">
                  {selectedRequest.working_days_count} {t("vacation.days")}
                </p>
                {selectedRequest.employee_note && (
                  <p className="text-sm text-neutral-600 bg-neutral-50 rounded-md p-3 mt-2">
                    &ldquo;{selectedRequest.employee_note}&rdquo;
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="review-note" className="block text-base/7 font-semibold text-neutral-950">
                  {t("vacation.reviewerNote")}
                </label>
                <div className="mt-2">
                  <Input
                    id="review-note"
                    type="text"
                    placeholder={t("vacation.reviewerNotePlaceholder")}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  size="lg"
                  className="flex-1"
                  onClick={() => reviewRequest(selectedRequest.id, "approved")}
                >
                  <Check className="size-4 mr-2" />
                  {t("vacation.approve")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={() => reviewRequest(selectedRequest.id, "denied")}
                >
                  <X className="size-4 mr-2" />
                  {t("vacation.deny")}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
