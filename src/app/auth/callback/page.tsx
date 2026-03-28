"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { setToken } from "@/utils/auth";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const isNew = searchParams.get("is_new") === "1";

    if (token) {
      setToken(token);

      // Also set the httpOnly cookie via API route
      fetch("/api/auth/social-callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).then(() => {
        router.replace("/dashboard");
      });
    } else {
      router.replace("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Auðkenning í gangi...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Hleð...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
