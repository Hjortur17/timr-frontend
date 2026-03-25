"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Shift, ShiftForm, User } from "@/types/forms";
import { shiftFormSchema } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

function ShiftForm({ onCreated }: { onCreated: (shift: Shift) => void }) {
  const { register, handleSubmit } = useForm<ShiftForm>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: { title: "", start_time: "", end_time: "", notes: "" },
  });

  const onSubmit = async (data: ShiftForm) => {
    const response = await axios.post("/api/manager/shifts", { ...data, status: "draft" }, { headers: authHeaders() });
    onCreated(response.data.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-base/7 font-semibold text-neutral-950">
          Heiti vaktar
        </label>
        <div className="mt-2">
          <Input id="title" type="text" placeholder="t.d. Morgunvakt" {...register("title")} />
        </div>
      </div>
      <div>
        <label htmlFor="start_time" className="block text-base/7 font-semibold text-neutral-950">
          Upphafstími
        </label>
        <div className="mt-2">
          <Input id="start_time" type="time" {...register("start_time")} />
        </div>
      </div>
      <div>
        <label htmlFor="end_time" className="block text-base/7 font-semibold text-neutral-950">
          Lokatími
        </label>
        <div className="mt-2">
          <Input id="end_time" type="time" {...register("end_time")} />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-base/7 font-semibold text-neutral-950">
          Athugasemdir
        </label>
        <div className="mt-2">
          <Input id="notes" type="text" placeholder="Valfrjálst" {...register("notes")} />
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full">
        Bæta við vakt
      </Button>
    </form>
  );
}

export default function ShiftsStep({ setUser }: { user: User; setUser: (user: User) => void }) {
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
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">Búa til vaktir</h2>
        <p className="mt-2 text-center text-sm/6 text-neutral-500">
          Bættu við vöktum sem starfsfólk verður úthlutað á síðar.
        </p>
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
              Halda áfram
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
