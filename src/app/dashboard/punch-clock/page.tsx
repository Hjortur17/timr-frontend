"use client";

import axios from "axios";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ClockEntry, ShiftAssignment } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

type EmployeeState = "loading" | "no-shift" | "upcoming-shift" | "clocked-in" | "completed";

const DEV_COORDS = {
  latitude: 64.00320221192739,
  longitude: -22.554861687945017,
};

function getCoords(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => {
        if (process.env.NODE_ENV === "development") {
          resolve(DEV_COORDS);
        } else {
          reject(err);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

export default function PunchClockPage() {
  const t = useTranslations();
  const [shifts, setShifts] = useState<ShiftAssignment[]>([]);
  const [clockEntries, setClockEntries] = useState<ClockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [elapsed, setElapsed] = useState("");

  const fetchData = useCallback(async () => {
    const today = dayjs().format("YYYY-MM-DD");
    const headers = authHeaders();

    try {
      const [shiftsRes, entriesRes] = await Promise.all([
        axios.get("/api/employee/shifts", {
          headers,
          params: { from: today, to: today },
        }),
        axios.get("/api/employee/clock-entries", {
          headers,
          params: { from: today, to: today },
        }),
      ]);
      setShifts(shiftsRes.data.data ?? []);
      setClockEntries(entriesRes.data.data ?? []);
    } catch {
      toast.error(t("punchClock.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeEntry = useMemo(() => clockEntries.find((e) => !e.clocked_out_at), [clockEntries]);

  const clockedShiftIds = useMemo(() => new Set(clockEntries.map((e) => e.shift_id)), [clockEntries]);

  const nextShift = useMemo(() => {
    return shifts.find((s) => !clockedShiftIds.has(s.shift_id));
  }, [shifts, clockedShiftIds]);

  const employeeState: EmployeeState = useMemo(() => {
    if (loading) return "loading";
    if (activeEntry) return "clocked-in";
    if (shifts.length === 0) return "no-shift";
    if (clockEntries.length > 0 && clockEntries.every((e) => e.clocked_out_at)) return "completed";
    return "upcoming-shift";
  }, [loading, activeEntry, shifts, clockEntries]);

  // Countdown timer for upcoming shift
  useEffect(() => {
    if (employeeState !== "upcoming-shift" || !nextShift) return;

    const shiftStart = dayjs(`${nextShift.date} ${nextShift.shift.start_time}`);

    const tick = () => {
      const diff = shiftStart.diff(dayjs());
      if (diff <= 0) {
        setCountdown("");
        return;
      }
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1000);
      if (hours > 0) {
        setCountdown(`${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
      } else {
        setCountdown(`${minutes}:${String(seconds).padStart(2, "0")}`);
      }
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [employeeState, nextShift]);

  // Elapsed timer for clocked-in state
  useEffect(() => {
    if (employeeState !== "clocked-in" || !activeEntry) return;

    const clockedInAt = dayjs(activeEntry.clocked_in_at);

    const tick = () => {
      const diff = dayjs().diff(clockedInAt);
      const hours = Math.floor(diff / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1000);
      setElapsed(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [employeeState, activeEntry]);

  const handleClockIn = async () => {
    setClockingIn(true);
    try {
      const { latitude, longitude } = await getCoords();

      const body: Record<string, unknown> = { latitude, longitude };
      if (nextShift) {
        body.shift_id = nextShift.shift_id;
      }

      await axios.post("/api/employee/clock-in", body, {
        headers: authHeaders(),
      });

      toast.success(t("punchClock.clockedInSuccess"));
      await fetchData();
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && "PERMISSION_DENIED" in err) {
        const geoErr = err as GeolocationPositionError;
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          toast.error(t("punchClock.locationRequired"));
        } else {
          toast.error(t("punchClock.locationError"));
        }
      } else if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? t("punchClock.clockInError"));
      } else {
        toast.error(t("punchClock.clockInError"));
      }
    } finally {
      setClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    setClockingOut(true);
    try {
      await axios.post("/api/employee/clock-out", {}, { headers: authHeaders() });
      toast.success(t("punchClock.clockedOutSuccess"));
      await fetchData();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? t("punchClock.clockOutError"));
      } else {
        toast.error(t("punchClock.clockOutError"));
      }
    } finally {
      setClockingOut(false);
    }
  };

  if (employeeState === "loading") {
    return (
      <section className="h-full w-full flex flex-col items-center justify-center">
        <Spinner />
      </section>
    );
  }

  return (
    <section className="h-full w-full flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">{t("punchClock.title")}</h1>

        {employeeState === "upcoming-shift" && nextShift && (
          <div className="rounded-2xl text-lg p-4 bg-accent w-full mb-24">
            {countdown ? (
              <>
                {t("punchClock.shiftStartsIn")} <span className="font-bold tabular-nums">{countdown}</span>
              </>
            ) : (
              <span className="font-bold">{t("punchClock.shiftStarted")}</span>
            )}
          </div>
        )}

        {employeeState === "no-shift" && (
          <div className="rounded-2xl text-lg p-4 bg-accent w-full mb-24">
            {t("punchClock.noShift")} <br />
            {t("punchClock.noShiftExtra")}
          </div>
        )}

        {employeeState === "clocked-in" && (
          <div className="rounded-2xl text-lg p-4 bg-accent w-full mb-24">
            {t("punchClock.clockedIn")} <span className="font-bold tabular-nums">{elapsed}</span>
          </div>
        )}

        {employeeState === "completed" && (
          <div className="rounded-2xl text-lg p-4 bg-accent w-full mb-24">{t("punchClock.shiftCompleted")}</div>
        )}

        {(employeeState === "upcoming-shift" || employeeState === "no-shift") && (
          <Button
            className="text-4xl font-extrabold uppercase w-full h-24"
            onClick={handleClockIn}
            disabled={clockingIn}
          >
            {clockingIn ? <Spinner /> : t("punchClock.clockIn")}
          </Button>
        )}

        {employeeState === "clocked-in" && (
          <Button
            variant="secondary"
            className="text-4xl font-extrabold uppercase w-full h-24"
            onClick={handleClockOut}
            disabled={clockingOut}
          >
            {clockingOut ? <Spinner /> : t("punchClock.clockOut")}
          </Button>
        )}
      </div>
    </section>
  );
}
