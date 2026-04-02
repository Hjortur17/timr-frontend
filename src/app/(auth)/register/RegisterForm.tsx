"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RegisterForm } from "@/types/forms";
import { setToken } from "@/utils/auth";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviteToken = searchParams.get("token") ?? undefined;
  const inviteEmail = searchParams.get("email") ?? "";
  const isInvite = Boolean(inviteToken);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      name: "",
      email: inviteEmail,
      password: "",
      password_confirmation: "",
      invite_token: inviteToken,
    },
  });

  useEffect(() => {
    if (inviteEmail) setValue("email", inviteEmail);
    if (inviteToken) setValue("invite_token", inviteToken);
  }, [inviteEmail, inviteToken, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await axios.post("/api/forms/register", data);
      setToken(response.data.token);
      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        const errors = err.response.data.errors as Record<string, string[]>;
        for (const [field, messages] of Object.entries(errors)) {
          if (field === "name" || field === "email" || field === "password" || field === "password_confirmation") {
            setError(field, { message: messages[0] });
          }
        }
      } else {
        setError("email", { message: "Villa kom upp. Vinsamlegast reyndu aftur." });
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">
          {isInvite ? "Búa til aðgang" : "Nýskráning"}
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="px-6 py-12 ">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...register("invite_token")} />

            <div>
              <label htmlFor="name" className="block text-base/7 font-semibold text-neutral-950">
                Nafn
              </label>
              <div className="mt-2">
                <Input id="name" type="text" {...register("name")} />
              </div>
              {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-base/7 font-semibold text-neutral-950">
                Netfang
              </label>
              <div className="mt-2">
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  readOnly={isInvite}
                  className={isInvite ? "bg-muted" : ""}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-base/7 font-semibold text-neutral-950">
                Lykilorð
              </label>
              <div className="mt-2">
                <Input id="password" type="password" {...register("password")} />
              </div>
              {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-base/7 font-semibold text-neutral-950">
                Staðfesta lykilorð
              </label>
              <div className="mt-2">
                <Input id="password_confirmation" type="password" {...register("password_confirmation")} />
              </div>
              {errors.password_confirmation && (
                <p className="mt-1 text-sm text-destructive">{errors.password_confirmation.message}</p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full">
              {isInvite ? "Klára skráningu" : "Nýskrá"}
            </Button>
          </form>

          {!isInvite && <SocialLoginButtons />}
        </div>

        {!isInvite && (
          <p className="mt-10 text-center text-sm/6 text-neutral-500">
            Nú þegar með aðgang?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-primary/90">
              Innskrá
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
