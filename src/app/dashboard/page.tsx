"use client";

import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	TransitionChild,
} from "@headlessui/react";
import {
	BanknotesIcon,
	Bars3Icon,
	CalendarIcon,
	HomeIcon,
	UsersIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import CompanyStep from "@/components/onboarding/CompanyStep";
import DoneStep from "@/components/onboarding/DoneStep";
import SalaryStep from "@/components/onboarding/SalaryStep";
import ShiftsStep from "@/components/onboarding/ShiftsStep";
import StaffStep from "@/components/onboarding/StaffStep";
import type { User } from "@/types/forms";
import { authHeaders, clearToken, getToken } from "@/utils/auth";
import { cn } from "@/utils/classname";

const navigation = [
	{ name: "Stjórnborð", href: "#", icon: HomeIcon, current: true },
	{ name: "Vaktir", href: "#", icon: CalendarIcon, current: false },
	{ name: "Starfsmenn", href: "#", icon: UsersIcon, current: false },
	{ name: "Launakerfi", href: "#", icon: BanknotesIcon, current: false },
];
const teams = [
	{ id: 1, name: "Fyrirtæki 1", href: "#", initial: "F", current: false },
	{ id: 2, name: "Fyrirtæki 2", href: "#", initial: "F", current: false },
	{ id: 3, name: "Fyrirtæki 3", href: "#", initial: "F", current: false },
];

const ONBOARDING_COMPLETE = 6;

export default function Dashboard() {
	const router = useRouter();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

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

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-neutral-500">Hleð...</p>
			</div>
		);
	}

	if (!user) return null;

	if (user.onboarding_step < ONBOARDING_COMPLETE) {
		return <OnboardingWizard user={user} setUser={setUser} />;
	}

	return (
		<div>
			<Dialog
				open={sidebarOpen}
				onClose={setSidebarOpen}
				className="relative z-50 lg:hidden"
			>
				<DialogBackdrop
					transition
					className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
				/>

				<div className="fixed inset-0 flex">
					<DialogPanel
						transition
						className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
					>
						<TransitionChild>
							<div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
								<button
									type="button"
									onClick={() => setSidebarOpen(false)}
									className="-m-2.5 p-2.5"
								>
									<span className="sr-only">Close sidebar</span>
									<XMarkIcon aria-hidden className="size-6 text-white" />
								</button>
							</div>
						</TransitionChild>

						<div className="relative flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
							<div className="relative flex h-16 shrink-0 items-center">
								<Image
									alt="Your Company"
									src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
									className="h-8 w-auto"
									width={32}
									height={32}
								/>
								<Image
									alt="Your Company"
									src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
									className="h-8 w-auto hidden"
									width={32}
									height={32}
								/>
							</div>
							<nav className="relative flex flex-1 flex-col">
								<ul className="flex flex-1 flex-col gap-y-7">
									<li>
										<ul className="-mx-2 space-y-1">
											{navigation.map((item) => (
												<li key={item.name}>
													<a
														href={item.href}
														className={cn(
															item.current
																? "bg-gray-50 text-primary"
																: "text-gray-700 hover:bg-gray-50 hover:text-primary",
															"group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
														)}
													>
														<item.icon
															aria-hidden
															className={cn(
																item.current
																	? "text-primary"
																	: "text-gray-400 group-hover:text-primary",
																"size-6 shrink-0",
															)}
														/>
														{item.name}
													</a>
												</li>
											))}
										</ul>
									</li>
									<li>
										<div className="text-xs/6 font-semibold text-gray-400">
											Your teams
										</div>
										<ul className="-mx-2 mt-2 space-y-1">
											{teams.map((team) => (
												<li key={team.name}>
													<a
														href={team.href}
														className={cn(
															team.current
																? "bg-gray-50 text-primary"
																: "text-gray-700 hover:bg-gray-50 hover:text-primary",
															"group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
														)}
													>
														<span
															className={cn(
																team.current
																	? "border-primary text-primary"
																	: "border-gray-200 text-gray-400 group-hover:border-primary group-hover:text-primary",
																"flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium",
															)}
														>
															{team.initial}
														</span>
														<span className="truncate">{team.name}</span>
													</a>
												</li>
											))}
										</ul>
									</li>
								</ul>
							</nav>
						</div>
					</DialogPanel>
				</div>
			</Dialog>

			{/* Static sidebar for desktop */}
			<div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
				<div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
					<div className="flex h-16 shrink-0 items-center">
						<Image
							alt="Your Company"
							src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
							className="h-8 w-auto"
							width={32}
							height={32}
						/>
						<Image
							alt="Your Company"
							src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
							className="h-8 w-auto hidden"
							width={32}
							height={32}
						/>
					</div>
					<nav className="flex flex-1 flex-col">
						<ul className="flex flex-1 flex-col gap-y-7">
							<li>
								<ul className="-mx-2 space-y-1">
									{navigation.map((item) => (
										<li key={item.name}>
											<a
												href={item.href}
												className={cn(
													item.current
														? "bg-gray-50 text-primary"
														: "text-gray-700 hover:bg-gray-50 hover:text-primary",
													"group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
												)}
											>
												<item.icon
													aria-hidden
													className={cn(
														item.current
															? "text-primary"
															: "text-gray-400 group-hover:text-primary",
														"size-6 shrink-0",
													)}
												/>
												{item.name}
											</a>
										</li>
									))}
								</ul>
							</li>
							<li>
								<div className="text-xs/6 font-semibold text-gray-400">
									Your teams
								</div>
								<ul className="-mx-2 mt-2 space-y-1">
									{teams.map((team) => (
										<li key={team.name}>
											<a
												href={team.href}
												className={cn(
													team.current
														? "bg-gray-50 text-primary"
														: "text-gray-700 hover:bg-gray-50 hover:text-primary",
													"group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
												)}
											>
												<span
													className={cn(
														team.current
															? "border-primary text-primary"
															: "border-gray-200 text-gray-400 group-hover:border-primary group-hover:text-primary",
														"flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium",
													)}
												>
													{team.initial}
												</span>
												<span className="truncate">{team.name}</span>
											</a>
										</li>
									))}
								</ul>
							</li>
							<li className="-mx-6 mt-auto">
								<a
									href="/dashboard"
									className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
								>
									<Image
										alt=""
										src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
										className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5"
										width={32}
										height={32}
									/>
									<span className="sr-only">Your profile</span>
									<span aria-hidden="true">{user.name}</span>
								</a>
							</li>
						</ul>
					</nav>
				</div>
			</div>

			<div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-xs sm:px-6 lg:hidden">
				<button
					type="button"
					onClick={() => setSidebarOpen(true)}
					className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden"
				>
					<span className="sr-only">Open sidebar</span>
					<Bars3Icon aria-hidden className="size-6" />
				</button>
				<div className="flex-1 text-sm/6 font-semibold text-gray-900">
					Dashboard
				</div>
				<a href="/dashboard">
					<span className="sr-only">Your profile</span>
					<Image
						alt=""
						src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
						className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5"
						width={32}
						height={32}
					/>
				</a>
			</div>

			<main className="py-10 lg:pl-72">
				<div className="px-4 sm:px-6 lg:px-8">
					<div className="sm:mx-auto sm:w-full">
						<h1 className="text-2xl/9 font-bold tracking-tight text-neutral-900">
							Stjórnborð
						</h1>
						<p className="mt-2 text-sm/6 text-neutral-500">
							Velkomin/n, {user.name}.
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}

const STEP_NAMES = ["Fyrirtæki", "Vaktir", "Starfsfólk", "Launakerfi", "Lokið"];

function stepStatus(
	index: number,
	currentStep: number,
): "complete" | "current" | "upcoming" {
	if (index + 1 < currentStep) return "complete";
	if (index + 1 === currentStep) return "current";
	return "upcoming";
}

function OnboardingWizard({
	user,
	setUser,
}: {
	user: User;
	setUser: (user: User) => void;
}) {
	const currentStep = user.onboarding_step;

	const steps = STEP_NAMES.map((name, i) => ({
		id: `Skref ${i + 1}`,
		name,
		href: "#",
		status: stepStatus(i, currentStep),
	}));

	const stepProps = { user, setUser };

	return (
		<div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-3xl flex gap-12">
				<ProgressBar steps={steps} currentStep={currentStep} />

				{currentStep === 1 && <CompanyStep {...stepProps} />}
				{currentStep === 2 && <ShiftsStep {...stepProps} />}
				{currentStep === 3 && <StaffStep {...stepProps} />}
				{currentStep === 4 && <SalaryStep {...stepProps} />}
				{currentStep === 5 && <DoneStep {...stepProps} />}
			</div>
		</div>
	);
}
