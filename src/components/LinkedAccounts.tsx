"use client";

import { Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authHeaders } from "@/utils/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface SocialAccount {
  id: number;
  provider: string;
  provider_email: string;
  avatar_url: string | null;
  created_at: string;
}

export function LinkedAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/auth/social-accounts", {
        headers: authHeaders(),
      });
      const data = await res.json();
      setAccounts(data.data ?? []);
    } catch {
      setError("Ekki tókst að sækja tengda reikninga.");
    } finally {
      setLoading(false);
    }
  };

  const unlinkAccount = async (id: number) => {
    try {
      const res = await fetch(`/api/auth/social-accounts/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Villa kom upp.");
        return;
      }

      setAccounts((prev) => prev.filter((a) => a.id !== id));
      setError(null);
    } catch {
      setError("Ekki tókst að aftengja reikning.");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const providerLabel = (provider: string) => {
    switch (provider) {
      case "google":
        return "Google";
      case "apple":
        return "Apple";
      default:
        return provider;
    }
  };

  return (
    <div>
      <h2 className="text-base/7 font-semibold">Tengdir reikningar</h2>
      <p className="mt-1 text-sm/6 text-muted-foreground">Tengdu Google eða Apple reikninginn þinn til að skrá þig inn hraðar.</p>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Hleð...</p>}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && accounts.length === 0 && (
          <p className="text-sm text-muted-foreground">Enginn reikningur tengdur.</p>
        )}

        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              {account.avatar_url && (
                <img src={account.avatar_url} alt="" className="size-8 rounded-full" />
              )}
              <div>
                <p className="text-sm font-medium">{providerLabel(account.provider)}</p>
                <p className="text-sm text-muted-foreground">{account.provider_email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => unlinkAccount(account.id)}>
              <Trash2Icon className="size-4 text-destructive" />
            </Button>
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <a
            href={`${API_URL}/api/auth/redirect/google`}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>
            Tengja Google
          </a>
          <a
            href={`${API_URL}/api/auth/redirect/apple`}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <svg fill="currentColor" viewBox="0 0 640 640" aria-hidden="true" className="size-4">
              <path d="M447.1 332.7C446.9 296 463.5 268.3 497.1 247.9C478.3 221 449.9 206.2 412.4 203.3C376.9 200.5 338.1 224 323.9 224C308.9 224 274.5 204.3 247.5 204.3C191.7 205.2 132.4 248.8 132.4 337.5C132.4 363.7 137.2 390.8 146.8 418.7C159.6 455.4 205.8 545.4 254 543.9C279.2 543.3 297 526 329.8 526C361.6 526 378.1 543.9 406.2 543.9C454.8 543.2 496.6 461.4 508.8 424.6C443.6 393.9 447.1 334.6 447.1 332.7zM390.5 168.5C417.8 136.1 415.3 106.6 414.5 96C390.4 97.4 362.5 112.4 346.6 130.9C329.1 150.7 318.8 175.2 321 202.8C347.1 204.8 370.9 191.4 390.5 168.5z" />
            </svg>
            Tengja Apple
          </a>
        </div>
      </div>
    </div>
  );
}
