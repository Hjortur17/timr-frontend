"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@/context/UserContext";
import { type Locale, localeNames, locales } from "@/i18n/config";
import { authHeaders } from "@/utils/auth";

export function NavSecondary({ ...props }: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const locale = useLocale();
  const t = useTranslations("language");
  const { setUser } = useUser();

  const switchLocale = async (newLocale: string) => {
    const res = await fetch("/api/auth/user", {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
    });

    if (res.ok) {
      const json = await res.json();
      setUser(json.data);
    }

    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    window.location.reload();
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="sm">
                    <Globe className="size-4" />
                    <span>{localeNames[locale as Locale]}</span>
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" align="start" sideOffset={4}>
                <DropdownMenuRadioGroup value={locale} onValueChange={switchLocale}>
                  {locales.map((loc) => (
                    <DropdownMenuRadioItem key={loc} value={loc}>
                      {localeNames[loc]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
