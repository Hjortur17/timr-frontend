"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import Input from "@/components/Input";
import type { RegisterForm } from "@/types/forms";
import { setToken } from "@/utils/auth";

export default function Register() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    const response = await axios.post("/api/forms/register", data);
    setToken(response.data.token);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">Nýskráning</h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="px-6 py-12 ">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input label="Nafn" name="name" type="text" register={register} />

            <Input label="Netfang" name="email" type="email" register={register} />

            <Input label="Lykilorð" name="password" type="password" register={register} />

            <Input label="Staðfesta lykilorð" name="password_confirmation" type="password" register={register} />

            <Button type="submit">Nýskrá</Button>
          </form>
        </div>

        <p className="mt-10 text-center text-sm/6 text-neutral-500">
          Nú þegar með aðgang?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary/90">
            Innskrá
          </Link>
        </p>
      </div>
    </div>
  );
}
