"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/UserContext";
import { localeNames, locales } from "@/i18n/config";
import {
  type UpdateProfileEmailForm,
  type UpdateProfileNameForm,
  updateProfileEmailSchema,
  updateProfileNameSchema,
} from "@/types/forms";
import { authHeaders } from "@/utils/auth";

type EditingField = "name" | "email" | "locale" | null;

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const t = useTranslations();
  const [editingField, setEditingField] = useState<EditingField>(null);

  const nameForm = useForm<UpdateProfileNameForm>({
    resolver: zodResolver(updateProfileNameSchema),
  });

  const emailForm = useForm<UpdateProfileEmailForm>({
    resolver: zodResolver(updateProfileEmailSchema),
  });

  const [selectedLocale, setSelectedLocale] = useState(user.locale);
  const [localeSubmitting, setLocaleSubmitting] = useState(false);

  function startEditing(field: "name" | "email" | "locale") {
    setEditingField(field);
    if (field === "name") {
      nameForm.reset({ name: user.name });
    } else if (field === "email") {
      emailForm.reset({ email: user.email });
    } else {
      setSelectedLocale(user.locale);
    }
  }

  function handleCancel() {
    setEditingField(null);
    nameForm.reset();
    emailForm.reset();
  }

  async function onNameSubmit(data: UpdateProfileNameForm) {
    try {
      const res = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.errors) {
          for (const [field, messages] of Object.entries(json.errors)) {
            nameForm.setError(field as keyof UpdateProfileNameForm, {
              message: (messages as string[])[0],
            });
          }
        } else {
          toast.error(json.message ?? t("common.error"));
        }
        return;
      }

      setUser(json.data);
      setEditingField(null);
      toast.success(t("profile.nameUpdated"));
    } catch {
      toast.error(t("profile.nameUpdateError"));
    }
  }

  async function onEmailSubmit(data: UpdateProfileEmailForm) {
    try {
      const res = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.errors) {
          for (const [field, messages] of Object.entries(json.errors)) {
            emailForm.setError(field as keyof UpdateProfileEmailForm, {
              message: (messages as string[])[0],
            });
          }
        } else {
          toast.error(json.message ?? t("common.error"));
        }
        return;
      }

      setUser(json.data);
      setEditingField(null);
      toast.success(t("profile.emailUpdated"));
    } catch {
      toast.error(t("profile.emailUpdateError"));
    }
  }

  async function onLocaleSubmit() {
    setLocaleSubmitting(true);
    try {
      const res = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ locale: selectedLocale }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message ?? t("common.error"));
        return;
      }

      setUser(json.data);

      document.cookie = `NEXT_LOCALE=${selectedLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      window.location.reload();
    } catch {
      toast.error(t("profile.languageUpdateError"));
    } finally {
      setLocaleSubmitting(false);
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
        <div>
          <h2 className="text-base/7 font-semibold text-foreground">{t("profile.title")}</h2>
          <p className="mt-1 text-sm/6 text-muted-foreground">{t("profile.description")}</p>

          <dl className="mt-6 divide-y divide-border border-t border-border text-sm/6">
            <div className="py-6 sm:flex">
              <dt className="font-medium text-foreground sm:w-64 sm:flex-none sm:pr-6">{t("profile.fullName")}</dt>
              <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                {editingField === "name" ? (
                  <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="flex w-full items-start gap-x-3">
                    <div className="flex-auto">
                      <Input {...nameForm.register("name")} />
                      {nameForm.formState.errors.name && (
                        <p className="mt-1 text-sm text-destructive">{nameForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <Button type="submit" size="sm" disabled={nameForm.formState.isSubmitting}>
                      {nameForm.formState.isSubmitting ? `${t("common.save")}...` : t("common.save")}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                      {t("common.cancel")}
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="text-foreground">{user.name}</div>
                    <button
                      type="button"
                      className="font-semibold text-primary hover:text-primary/80"
                      onClick={() => startEditing("name")}
                    >
                      {t("common.edit")}
                    </button>
                  </>
                )}
              </dd>
            </div>
            <div className="py-6 sm:flex">
              <dt className="font-medium text-foreground sm:w-64 sm:flex-none sm:pr-6">{t("common.email")}</dt>
              <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                {editingField === "email" ? (
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex w-full items-start gap-x-3">
                    <div className="flex-auto">
                      <Input type="email" {...emailForm.register("email")} />
                      {emailForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <Button type="submit" size="sm" disabled={emailForm.formState.isSubmitting}>
                      {emailForm.formState.isSubmitting ? `${t("common.save")}...` : t("common.save")}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                      {t("common.cancel")}
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="text-foreground">{user.email}</div>
                    <button
                      type="button"
                      className="font-semibold text-primary hover:text-primary/80"
                      onClick={() => startEditing("email")}
                    >
                      {t("common.edit")}
                    </button>
                  </>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-base/7 font-semibold text-foreground">{t("profile.languageAndDates")}</h2>
          <p className="mt-1 text-sm/6 text-muted-foreground">{t("profile.languageAndDatesDescription")}</p>

          <dl className="mt-6 divide-y divide-border border-t border-border text-sm/6">
            <div className="py-6 sm:flex">
              <dt className="font-medium text-foreground sm:w-64 sm:flex-none sm:pr-6">{t("profile.languageLabel")}</dt>
              <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                {editingField === "locale" ? (
                  <div className="flex w-full items-start gap-x-3">
                    <select
                      value={selectedLocale}
                      onChange={(e) => setSelectedLocale(e.target.value)}
                      className="block h-9 flex-auto rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {locales.map((loc) => (
                        <option key={loc} value={loc}>
                          {localeNames[loc]}
                        </option>
                      ))}
                    </select>
                    <Button type="button" size="sm" disabled={localeSubmitting} onClick={onLocaleSubmit}>
                      {localeSubmitting ? `${t("common.save")}...` : t("common.save")}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                      {t("common.cancel")}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-foreground">
                      {localeNames[user.locale as keyof typeof localeNames] ?? user.locale}
                    </div>
                    <button
                      type="button"
                      className="font-semibold text-primary hover:text-primary/80"
                      onClick={() => startEditing("locale")}
                    >
                      {t("common.edit")}
                    </button>
                  </>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
