"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useUser } from "@/context/UserContext";

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  const { isEmployee } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isEmployee) {
      router.replace("/dashboard");
    }
  }, [isEmployee, router]);

  if (!isEmployee) return null;

  return <>{children}</>;
}
