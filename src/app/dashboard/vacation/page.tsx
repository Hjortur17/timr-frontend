"use client";

import EmployeeVacation from "@/components/vacation/EmployeeVacation";
import ManagerVacation from "@/components/vacation/ManagerVacation";
import { useUser } from "@/context/UserContext";

export default function VacationPage() {
  const { isManager } = useUser();

  return <div className="px-4 sm:px-6 lg:px-8">{isManager ? <ManagerVacation /> : <EmployeeVacation />}</div>;
}
