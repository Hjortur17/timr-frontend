"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { User } from "@/types/forms";
import { authHeaders, clearToken, getToken } from "@/utils/auth";

interface UserContextValue {
  user: User;
  setUser: (user: User) => void;
  isManager: boolean;
  isEmployee: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const currentLocale = useLocale();
  const t = useTranslations("common");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      setLoading(false);
      return;
    }

    axios
      .get("/api/auth/user", { headers: authHeaders() })
      .then(async (res) => {
        const userData = res.data.data;
        setUser(userData);
        setLoading(false);

        // Sync next-intl locale cookie with user's DB preference
        if (userData.locale && userData.locale !== currentLocale) {
          document.cookie = `NEXT_LOCALE=${userData.locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
          window.location.reload();
        }
      })
      .catch(() => {
        clearToken();
        router.replace("/login");
      });
  }, [router, currentLocale]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">{t("loading")}</p>
      </div>
    );
  }

  if (!user) return null;

  const isManager = (user.companies ?? []).some(
    (c) => c.id === user.company_id && (c.role === "owner" || c.role === "admin"),
  );
  const isEmployee = !isManager;

  async function logout() {
    await axios.post("/api/auth/logout", null, { headers: authHeaders() });
    clearToken();
    router.replace("/login");
  }

  return (
    <UserContext.Provider value={{ user, setUser, isManager, isEmployee, logout }}>{children}</UserContext.Provider>
  );
}
