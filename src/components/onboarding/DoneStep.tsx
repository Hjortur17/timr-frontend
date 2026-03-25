"use client";

import axios from "axios";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

export default function DoneStep({ setUser }: { user: User; setUser: (user: User) => void }) {
  const onFinish = async () => {
    const response = await axios.patch("/api/auth/onboarding", { step: 6 }, { headers: authHeaders() });
    setUser(response.data.data);
  };

  return (
    <div className="flex-1">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">Allt tilbúið!</h2>
        <p className="mt-2 text-center text-sm/6 text-neutral-500">
          Fyrirtækið þitt er tilbúið. Þú getur nú farið í stjórnborðið.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="px-6 py-12">
          <Button type="button" size="lg" className="w-full" onClick={onFinish}>
            Klára
          </Button>
        </div>
      </div>
    </div>
  );
}
