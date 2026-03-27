"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useUser } from "@/context/UserContext";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  const { isManager } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isManager) {
      router.replace("/dashboard");
    }
  }, [isManager, router]);

  if (!isManager) return null;

  return <>{children}</>;
}
