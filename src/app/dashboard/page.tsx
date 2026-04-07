"use client";

import axios from "axios";
import { CalendarArrowDown, CalendarSync } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useCallback, useState } from "react";
import { toast } from "sonner";
import EmployeeWeeklyCalendar from "@/components/shifts/EmployeeWeeklyCalendar";
import WeeklyCalendar from "@/components/shifts/WeeklyCalendar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { authHeaders } from "@/utils/auth";

export default function ShiftsPage() {
  const t = useTranslations();
  const { isManager, isEmployee } = useUser();
  const [actions, setActions] = useState<ReactNode>(null);

  const handleActionsChange = useCallback((node: ReactNode) => {
    setActions(node);
  }, []);

  const downloadCalendar = async () => {
    try {
      const response = await axios.get("/api/employee/shifts/ical", {
        headers: authHeaders(),
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/calendar" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "vaktir.ics";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error(t("shifts.downloadCalendarError"));
    }
  };

  const subscribeCalendar = async () => {
    try {
      const response = await axios.post(
        "/api/employee/calendar-subscribe",
        {},
        {
          headers: authHeaders(),
        },
      );

      const httpsUrl: string = response.data.data.url;
      const webcalUrl = httpsUrl.replace(/^https?:\/\//, "webcal://");
      window.location.href = webcalUrl;
    } catch {
      toast.error(t("shifts.subscribeCalendarError"));
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full flex items-end justify-between">
        <div>
          <h1 className="text-2xl/9 font-bold tracking-tight text-neutral-900">{t("shifts.title")}</h1>
          <p className="mt-2 text-sm/6 text-neutral-500">{t("shifts.description")}</p>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
        {isEmployee && (
          <div className="flex items-center gap-2">
            {/*<Button type="button" variant="outline" onClick={downloadCalendar}>
              <CalendarArrowDown />
              Sækja dagatal
            </Button>*/}
            <Button type="button" onClick={subscribeCalendar}>
              <CalendarSync />
              {t("shifts.downloadCalendar")}
            </Button>
          </div>
        )}
      </div>

      {isManager && <WeeklyCalendar onActionsChange={handleActionsChange} />}
      {isEmployee && <EmployeeWeeklyCalendar />}
    </div>
  );
}
