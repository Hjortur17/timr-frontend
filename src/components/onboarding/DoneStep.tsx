"use client";

import axios from "axios";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

export default function DoneStep({ setUser }: { user: User; setUser: (user: User) => void }) {
  const t = useTranslations("onboarding");

  const onFinish = async () => {
    const response = await axios.patch("/api/auth/onboarding", { step: 6 }, { headers: authHeaders() });
    setUser(response.data.data);
  };

  return (
    <div className="flex-1">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">{t("allReady")}</h2>
        <p className="mt-2 text-center text-sm/6 text-neutral-500">{t("allReadyDescription")}</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="px-6 py-12">
          <Button type="button" size="lg" className="w-full" onClick={onFinish}>
            {t("finish")}
          </Button>
        </div>
      </div>
    </div>
  );
}
