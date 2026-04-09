"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Employee, EmployeeForm as EmployeeFormData, User } from "@/types/forms";
import { employeeFormSchema } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

function CreateEmployeeForm({ onCreated }: { onCreated: (employee: Employee) => void }) {
  const t = useTranslations();
  const { register, handleSubmit } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    const response = await axios.post("/api/manager/employees", data, {
      headers: authHeaders(),
    });
    onCreated(response.data.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-base/7 font-semibold text-neutral-950">
          {t("common.name")}
        </label>
        <div className="mt-2">
          <Input id="name" type="text" placeholder={t("employees.fullNamePlaceholder")} {...register("name")} />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-base/7 font-semibold text-neutral-950">
          {t("employees.emailOptional")}
        </label>
        <div className="mt-2">
          <Input id="email" type="email" placeholder="netfang@timr.is" {...register("email")} />
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="block text-base/7 font-semibold text-neutral-950">
          {t("employees.phoneOptional")}
        </label>
        <div className="mt-2">
          <Input id="phone" type="tel" placeholder="000 0000" {...register("phone")} />
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full">
        {t("employees.addEmployee")}
      </Button>
    </form>
  );
}

export default function StaffStep({ setUser }: { user: User; setUser: (user: User) => void }) {
  const t = useTranslations();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formKey, setFormKey] = useState(0);

  const onCreated = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
    setFormKey((k) => k + 1);
  };

  const onContinue = async () => {
    const response = await axios.patch("/api/auth/onboarding", { step: 4 }, { headers: authHeaders() });
    setUser(response.data.data);
  };

  return (
    <div className="flex-1">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">
          {t("onboarding.addStaff")}
        </h2>
        <p className="mt-2 text-center text-sm/6 text-neutral-500">{t("onboarding.addStaffDescription")}</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="px-6 py-12">
          <CreateEmployeeForm key={formKey} onCreated={onCreated} />

          {employees.length > 0 && (
            <ul className="mt-8 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
              {employees.map((emp) => (
                <li key={emp.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{emp.name}</p>
                    {emp.email && <p className="text-xs text-neutral-500">{emp.email}</p>}
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
