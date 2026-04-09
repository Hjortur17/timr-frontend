"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimeInput } from "@/components/ui/time-input";
import type { Shift, ShiftForm, User } from "@/types/forms";
import { shiftFormSchema } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

function ShiftForm({ onCreated }: { onCreated: (shift: Shift) => void }) {
  const t = useTranslations();
  const { register, handleSubmit } = useForm<ShiftForm>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: { title: "", start_time: "", end_time: "", notes: "" },
  });

  const onSubmit = async (data: ShiftForm) => {
    const response = await axios.post("/api/manager/shifts", data, { headers: authHeaders() });
    onCreated(response.data.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-base/7 font-semibold text-neutral-950">
          {t("shifts.shiftTitle")}
        </label>
        <div className="mt-2">
          <Input id="title" type="text" placeholder={t("shifts.namePlaceholder")} {...register("title")} />
        </div>
      </div>
      <div>
        <label htmlFor="start_time" className="block text-base/7 font-semibold text-neutral-950">
          {t("shifts.startTime")}
        </label>
        <div className="mt-2">
          <TimeInput id="start_time" placeholder="HH:MM" {...register("start_time")} />
        </div>
      </div>
      <div>
        <label htmlFor="end_time" className="block text-base/7 font-semibold text-neutral-950">
          {t("shifts.endTime")}
        </label>
        <div className="mt-2">
          <TimeInput id="end_time" placeholder="HH:MM" {...register("end_time")} />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-base/7 font-semibold text-neutral-950">
          {t("onboarding.shiftComments")}
        </label>
        <div className="mt-2">
          <Input id="notes" type="text" placeholder={t("onboarding.optionalPlaceholder")} {...register("notes")} />
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full">
        {t("shifts.addShift")}
      </Button>
    </form>
  );
}

export default function ShiftsStep({ setUser }: { user: User; setUser: (user: User) => void }) {
  const t = useTranslations();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [formKey, setFormKey] = useState(0);

  const onCreated = (shift: Shift) => {
    setShifts((prev) => [...prev, shift]);
    setFormKey((k) => k + 1);
  };

  const onContinue = async () => {
    const response = await axios.patch("/api/auth/onboarding", { step: 3 }, { headers: authHeaders() });
    setUser(response.data.data);
  };

  return (
    <div className="flex-1">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">
          {t("onboarding.createShifts")}
        </h2>
        <p className="mt-2 text-center text-sm/6 text-neutral-500">{t("onboarding.createShiftsDescription")}</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="px-6 py-12">
          <ShiftForm key={formKey} onCreated={onCreated} />

          {shifts.length > 0 && (
            <ul className="mt-8 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
              {shifts.map((shift) => (
                <li key={shift.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{shift.title}</p>
                    <p className="text-xs text-neutral-500">
                      {shift.start_time} — {shift.end_time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <Button type="button" size="lg" className="w-full" onClick={onContinue}>
              {t("common.continue")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
