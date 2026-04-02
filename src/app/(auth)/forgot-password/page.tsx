"use client";

import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ForgotPasswordForm } from "@/types/forms";

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    await axios.post("/api/forms/forgot-password", data);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">Gleymt lykilorð</h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="px-6 py-12">
          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-neutral-600">
                Ef netfangið er skráð hjá okkur munum við senda endurstillingartengil. Athugaðu tölvupóstinn þinn.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-base/7 font-semibold text-neutral-950">
                  Netfang
                </label>
                <div className="mt-2">
                  <Input id="email" type="email" {...register("email")} />
                </div>
                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div>
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  Senda endurstillingartengil
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-10 text-center text-sm/6 text-neutral-500">
          <Link href="/login" className="font-semibold text-primary hover:text-primary/90">
            Til baka í innskráningu
          </Link>
        </p>
      </div>
    </div>
  );
}
