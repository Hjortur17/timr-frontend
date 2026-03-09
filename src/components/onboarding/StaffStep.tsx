"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/Button";
import Input from "@/components/Input";
import type { Employee, EmployeeForm as EmployeeFormData, User } from "@/types/forms";
import { employeeFormSchema } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

function CreateEmployeeForm({
	onCreated,
}: {
	onCreated: (employee: Employee) => void;
}) {
	const { register, handleSubmit } = useForm<EmployeeFormData>({
		resolver: zodResolver(employeeFormSchema),
		defaultValues: { name: "", email: "", phone: "" },
	});

	const onSubmit = async (data: EmployeeFormData) => {
		const response = await axios.post("/api/manager/employees", data, {
			headers: authHeaders(),
		});
		onCreated(response.data.data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<Input
				label="Nafn"
				name="name"
				type="text"
				placeholder="Fullt nafn"
				register={register}
			/>
			<Input
				label="Netfang (valfrjálst)"
				name="email"
				type="email"
				placeholder="netfang@timr.is"
				register={register}
			/>
			<Input
				label="Sími (valfrjálst)"
				name="phone"
				type="tel"
				placeholder="000 0000"
				register={register}
			/>
			<Button type="submit">Bæta við starfsmanni</Button>
		</form>
	);
}

export default function StaffStep({
	setUser,
}: {
	user: User;
	setUser: (user: User) => void;
}) {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [formKey, setFormKey] = useState(0);

	const onCreated = (employee: Employee) => {
		setEmployees((prev) => [...prev, employee]);
		setFormKey((k) => k + 1);
	};

	const onContinue = async () => {
		const response = await axios.patch(
			"/api/auth/onboarding",
			{ step: 4 },
			{ headers: authHeaders() },
		);
		setUser(response.data.data);
	};

	return (
		<div className="flex-1">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">
					Bæta við starfsfólki
				</h2>
				<p className="mt-2 text-center text-sm/6 text-neutral-500">
					Skráðu starfsfólk sem mun vinna í fyrirtækinu.
				</p>
			</div>

			<div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
				<div className="px-6 py-12">
					<CreateEmployeeForm key={formKey} onCreated={onCreated} />

					{employees.length > 0 && (
						<ul className="mt-8 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
							{employees.map((emp) => (
								<li
									key={emp.id}
									className="flex items-center justify-between px-4 py-3"
								>
									<div>
										<p className="text-sm font-semibold text-neutral-900">
											{emp.name}
										</p>
										{emp.email && (
										<p className="text-xs text-neutral-500">{emp.email}</p>
									)}
									</div>
								</li>
							))}
						</ul>
					)}

					<div className="mt-8">
						<Button type="button" onClick={onContinue}>
							Halda áfram
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
