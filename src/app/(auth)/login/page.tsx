"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LoginForm } from "@/types/forms";
import { setToken } from "@/utils/auth";

export default function Login() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    const response = await axios.post("/api/forms/login", data);
    setToken(response.data.token);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">
          Innskráning
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="px-6 py-12 ">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-base/7 font-semibold text-neutral-950"
              >
                Netfang
              </label>
              <div className="mt-2">
                <Input id="email" type="email" {...register("email")} />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-base/7 font-semibold text-neutral-950"
              >
                Lykilorð
              </label>
              <div className="mt-2">
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <div className="flex h-6 shrink-0 items-center">
                  <div className="group grid size-4 grid-cols-1">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="col-start-1 row-start-1 appearance-none rounded-sm border border-neutral-300 bg-white checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:border-neutral-300 disabled:bg-neutral-100 disabled:checked:bg-neutral-100 forced-colors:appearance-auto"
                    />
                    <svg
                      fill="none"
                      viewBox="0 0 14 14"
                      className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-neutral-950/25"
                    >
                      <path
                        d="M3 8L6 11L11 3.5"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-0 group-has-checked:opacity-100"
                      />
                      <path
                        d="M3 7H11"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-0 group-has-indeterminate:opacity-100"
                      />
                    </svg>
                  </div>
                </div>
                <label
                  htmlFor="remember-me"
                  className="block text-sm/6 text-neutral-900"
                >
                  Muna mig
                </label>
              </div>

              <div className="text-sm/6">
                <a
                  href="#"
                  className="font-semibold text-primary hover:text-primary/90"
                >
                  Gleymt lykilorð?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" size="lg" className="w-full">
                Innskrá
              </Button>
            </div>
          </form>

          <SocialLoginButtons />
        </div>

        <p className="mt-10 text-center text-sm/6 text-neutral-500">
          Ekki með aðgang?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-primary/90"
          >
            Nýskráning
          </Link>
        </p>
      </div>
    </div>
  );
}
