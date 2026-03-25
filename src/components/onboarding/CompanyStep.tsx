"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CompanyForm, User } from "@/types/forms";
import { companyFormSchema } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

export default function CompanyStep({ setUser }: { user: User; setUser: (user: User) => void }) {
  const { register, handleSubmit } = useForm<CompanyForm>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: CompanyForm) => {
    const response = await axios.post("/api/auth/company", data, {
      headers: authHeaders(),
    });
    setUser(response.data.data);
  };

  return (
    <div className="flex-1">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">Stofna fyrirtæki</h2>
        <p className="mt-2 text-center text-sm/6 text-neutral-500">Til að halda áfram þarftu að stofna fyrirtæki.</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="px-6 py-12">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-base/7 font-semibold text-neutral-950">
                Nafn fyrirtækis
              </label>
              <div className="mt-2">
                <Input id="name" type="text" placeholder="Nafn fyrirtækis" {...register("name")} />
              </div>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Halda áfram
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
