"use client";

import { useTranslations } from "next-intl";

export default function CompanyPage() {
  const t = useTranslations();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full">
        <h1 className="text-2xl/9 font-bold tracking-tight text-foreground">{t("settings.company")}</h1>
        <p className="mt-2 text-sm/6 text-muted-foreground">{t("shifts.description")}</p>
      </div>
    </div>
  );
}
