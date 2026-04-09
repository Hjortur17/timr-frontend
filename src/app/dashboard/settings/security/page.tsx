"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LinkedAccounts } from "@/components/LinkedAccounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ChangePasswordForm, changePasswordFormSchema } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

export default function SecurityPage() {
  const t = useTranslations();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordFormSchema),
  });

  async function onSubmit(data: ChangePasswordForm) {
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.errors) {
          for (const [field, messages] of Object.entries(json.errors)) {
            setError(field as keyof ChangePasswordForm, {
              message: (messages as string[])[0],
            });
          }
        } else {
          toast.error(json.message ?? t("common.error"));
        }
        return;
      }

      toast.success(t("security.passwordUpdated"));
      reset();
    } catch {
      toast.error(t("security.passwordUpdateError"));
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
        <div>
          <h2 className="text-base/7 font-semibold text-foreground">{t("security.changePassword")}</h2>
          <p className="mt-1 text-sm/6 text-muted-foreground">{t("security.changePasswordDescription")}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 border-t border-border pt-6">
            <div className="grid max-w-md gap-y-6">
              <div>
                <label htmlFor="current_password" className="block text-sm/6 font-medium">
                  {t("security.currentPassword")}
                </label>
                <div className="mt-2">
                  <Input
                    id="current_password"
                    type="password"
                    autoComplete="current-password"
                    {...register("current_password")}
                  />
                </div>
                {errors.current_password && (
                  <p className="mt-1 text-sm text-destructive">{errors.current_password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm/6 font-medium">
                  {t("security.newPassword")}
                </label>
                <div className="mt-2">
                  <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
                </div>
                {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm/6 font-medium">
                  {t("security.confirmNewPassword")}
                </label>
                <div className="mt-2">
                  <Input
                    id="password_confirmation"
                    type="password"
                    autoComplete="new-password"
                    {...register("password_confirmation")}
                  />
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1 text-sm text-destructive">{errors.password_confirmation.message}</p>
                )}
              </div>

              <div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? `${t("common.save")}...` : t("security.savePassword")}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="border-t border-border pt-6">
          <LinkedAccounts />
        </div>
      </div>
    </div>
  );
}
