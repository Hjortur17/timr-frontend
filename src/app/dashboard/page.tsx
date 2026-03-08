"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import Input from "@/components/Input";
import type { CompanyForm, User } from "@/types/forms";
import { companyFormSchema } from "@/types/forms";
import { authHeaders, clearToken, getToken } from "@/utils/auth";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit } = useForm<CompanyForm>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    axios
      .get("/api/auth/user", { headers: authHeaders() })
      .then((res) => setUser(res.data.data))
      .catch(() => {
        clearToken();
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const onCreateCompany = async (data: CompanyForm) => {
    const response = await axios.post("/api/auth/company", data, {
      headers: authHeaders(),
    });
    setUser(response.data.data);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Hleð...</p>
      </div>
    );
  }

  if (!user) return null;

  if (!user.company_id) {
    return (
      <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">Stofna fyrirtæki</h2>
          <p className="mt-2 text-center text-sm/6 text-neutral-500">Til að halda áfram þarftu að stofna fyrirtæki.</p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="px-6 py-12">
            <form onSubmit={handleSubmit(onCreateCompany)} className="space-y-6">
              <Input
                label="Nafn fyrirtækis"
                name="name"
                type="text"
                placeholder="Nafn fyrirtækis"
                register={register}
              />

              <Button type="submit">Stofna fyrirtæki</Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <h1 className="text-2xl/9 font-bold tracking-tight text-neutral-900">Stjórnborð</h1>
        <p className="mt-2 text-sm/6 text-neutral-500">Velkomin/n, {user.name}.</p>
      </div>
    </div>
  );
}
