"use client";

import axios from "axios";
import Button from "@/components/Button";
import type { User } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

export default function SalaryStep({
	setUser,
}: {
	user: User;
	setUser: (user: User) => void;
}) {
	const onContinue = async () => {
		const response = await axios.patch(
			"/api/auth/onboarding",
			{ step: 5 },
			{ headers: authHeaders() },
		);
		setUser(response.data.data);
	};

	return (
		<div className="flex-1">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-neutral-900">
					Launakerfi
				</h2>
				<p className="mt-2 text-center text-sm/6 text-neutral-500">
					Tengdu launakerfi fyrirtækisins. Þessi virkni verður í boði fljótlega.
				</p>
			</div>

			<div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
				<div className="px-6 py-12">
					<div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
						<p className="text-sm text-neutral-600">
							Hér verður hægt að tengja launakerfi eins og laugrein.is eða
							annað launakerfi sem þú notar.
						</p>
					</div>

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
