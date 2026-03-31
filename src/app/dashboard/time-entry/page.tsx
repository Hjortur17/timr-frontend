"use client";

import EmployeeTimeEntry from "@/components/time-entry/EmployeeTimeEntry";
import ManagerTimeEntry from "@/components/time-entry/ManagerTimeEntry";
import { useUser } from "@/context/UserContext";

export default function TimeEntryPage() {
  const { isManager } = useUser();

  return <div className="px-4 sm:px-6 lg:px-8">{isManager ? <ManagerTimeEntry /> : <EmployeeTimeEntry />}</div>;
}
