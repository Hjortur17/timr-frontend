"use client";

import { useUser } from "@/context/UserContext";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full">
        <h1 className="text-2xl/9 font-bold tracking-tight text-neutral-900">Stjórnborð</h1>
        <p className="mt-2 text-sm/6 text-neutral-500">Velkomin/n, {user.name}.</p>
      </div>
    </div>
  );
}
