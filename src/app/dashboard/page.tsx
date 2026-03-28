"use client";

import EmployeeWeeklyCalendar from "@/components/shifts/EmployeeWeeklyCalendar";
import WeeklyCalendar from "@/components/shifts/WeeklyCalendar";
import { useUser } from "@/context/UserContext";

export default function ShiftsPage() {
  const { isManager, isEmployee } = useUser();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full">
        <h1 className="text-2xl/9 font-bold tracking-tight text-neutral-900">Vaktir</h1>
        <p className="mt-2 text-sm/6 text-neutral-500">Skoðaðu og skipulagðu vaktir.</p>
      </div>

      {isManager && <WeeklyCalendar />}
      {isEmployee && <EmployeeWeeklyCalendar />}
    </div>
  );
}
