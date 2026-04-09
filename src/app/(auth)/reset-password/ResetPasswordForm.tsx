"use client";

import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ResetPasswordForm } from "@/types/forms";

export default function ResetPasswordForm() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      token,
      email,
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setError(null);
    try {
      await axios.post("/api/forms/reset-password", data);
      setSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(t("common.error"));
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">
          {t("auth.resetPassword")}
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="px-6 py-12">
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-neutral-600">{t("auth.passwordReset")}</p>
              <Link href="/login" className="font-semibold text-primary hover:text-primary/90 text-sm">
                {t("auth.loginButton")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <input type="hidden" {...register("token")} />
              <input type="hidden" {...register("email")} />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div>
                <label htmlFor="password" className="block text-base/7 font-semibold text-neutral-950">
                  {t("auth.newPassword")}
                </label>
                <div className="mt-2">
                  <Input id="password" type="password" {...register("password")} />
                </div>
                {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-base/7 font-semibold text-neutral-950">
                  {t("common.confirmPassword")}
                </label>
                <div className="mt-2">
                  <Input id="password_confirmation" type="password" {...register("password_confirmation")} />
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1 text-sm text-destructive">{errors.password_confirmation.message}</p>
                )}
              </div>

              <div>
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {t("auth.resetPassword")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
