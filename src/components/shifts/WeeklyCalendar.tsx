"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Employee, Shift } from "@/types/forms";
import { authHeaders } from "@/utils/auth";
import { cn } from "@/utils/classname";

dayjs.extend(isoWeek);

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const SHIFT_COLORS = [
	{ bg: "bg-emerald-500", text: "text-white" },
	{ bg: "bg-orange-500", text: "text-white" },
	{ bg: "bg-cyan-500", text: "text-white" },
	{ bg: "bg-violet-500", text: "text-white" },
	{ bg: "bg-rose-500", text: "text-white" },
	{ bg: "bg-blue-500", text: "text-white" },
	{ bg: "bg-amber-500", text: "text-white" },
];

function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

function getShiftColor(title: string) {
	return SHIFT_COLORS[hashString(title) % SHIFT_COLORS.length];
}

function formatShiftTime(datetime: string): string {
	const d = dayjs(datetime);
	const formatted = d.format("h:mmA");
	return formatted.replace("AM", "A").replace("PM", "P");
}

function durationMinutes(startTime: string, endTime: string): number {
	return dayjs(endTime).diff(dayjs(startTime), "minute");
}

function formatDuration(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}min`;
}

function getWeekDays(weekStart: dayjs.Dayjs): dayjs.Dayjs[] {
	return Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
}

export default function WeeklyCalendar() {
	const [weekStart, setWeekStart] = useState(() =>
		dayjs().startOf("isoWeek"),
	);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(true);

	const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
	const weekEnd = weekDays[6];

	useEffect(() => {
		setLoading(true);
		Promise.all([
			axios.get("/api/manager/shifts", { headers: authHeaders() }),
			axios.get("/api/manager/employees", { headers: authHeaders() }),
		])
			.then(([shiftsRes, employeesRes]) => {
				setShifts(shiftsRes.data.data ?? []);
				setEmployees(employeesRes.data.data ?? []);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const weekShifts = useMemo(() => {
		const start = weekStart.startOf("day");
		const end = weekEnd.endOf("day");
		return shifts.filter((s) => {
			const d = dayjs(s.start_time);
			return (
				(d.isAfter(start) || d.isSame(start, "day")) &&
				(d.isBefore(end) || d.isSame(end, "day"))
			);
		});
	}, [shifts, weekStart, weekEnd]);

	const shiftsByEmployeeAndDay = useMemo(() => {
		const map = new Map<number, Map<number, Shift[]>>();
		for (const shift of weekShifts) {
			for (const emp of shift.employees) {
				let empMap = map.get(emp.id);
				if (!empMap) {
					empMap = new Map();
					map.set(emp.id, empMap);
				}
				const dayIndex = dayjs(shift.start_time).isoWeekday() - 1;
				let dayShifts = empMap.get(dayIndex);
				if (!dayShifts) {
					dayShifts = [];
					empMap.set(dayIndex, dayShifts);
				}
				dayShifts.push(shift);
			}
		}
		return map;
	}, [weekShifts]);

	const unassignedByDay = useMemo(() => {
		const map = new Map<number, Shift[]>();
		for (const shift of weekShifts) {
			if (shift.employees.length === 0) {
				const dayIndex = dayjs(shift.start_time).isoWeekday() - 1;
				let dayShifts = map.get(dayIndex);
				if (!dayShifts) {
					dayShifts = [];
					map.set(dayIndex, dayShifts);
				}
				dayShifts.push(shift);
			}
		}
		return map;
	}, [weekShifts]);

	const getEmployeeWeekMinutes = useCallback(
		(employeeId: number): number => {
			const empMap = shiftsByEmployeeAndDay.get(employeeId);
			if (!empMap) return 0;
			let total = 0;
			for (const [, dayShifts] of empMap) {
				for (const s of dayShifts) {
					total += durationMinutes(s.start_time, s.end_time);
				}
			}
			return total;
		},
		[shiftsByEmployeeAndDay],
	);

	const prevWeek = () => setWeekStart((w) => w.subtract(1, "week"));
	const nextWeek = () => setWeekStart((w) => w.add(1, "week"));
	const goToday = () => setWeekStart(dayjs().startOf("isoWeek"));

	const today = dayjs();
	const isCurrentWeek =
		today.isoWeek() === weekStart.isoWeek() &&
		today.year() === weekStart.year();

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-neutral-500">Hleð vöktum...</p>
			</div>
		);
	}

	return (
		<div className="mt-6">
			{/* Week Navigation */}
			<div className="mb-4 flex items-center gap-4">
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={prevWeek}
						className="rounded-lg border border-neutral-300 p-2 hover:bg-neutral-50 transition-colors"
					>
						<ChevronLeftIcon className="size-4 text-neutral-600" />
					</button>
					<button
						type="button"
						onClick={nextWeek}
						className="rounded-lg border border-neutral-300 p-2 hover:bg-neutral-50 transition-colors"
					>
						<ChevronRightIcon className="size-4 text-neutral-600" />
					</button>
				</div>
				{!isCurrentWeek && (
					<button
						type="button"
						onClick={goToday}
						className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
					>
						Í dag
					</button>
				)}
				<h2 className="text-lg font-semibold text-neutral-900">
					{weekStart.format("D. MMM")} – {weekEnd.format("D. MMM YYYY")}
				</h2>
			</div>

			{/* Calendar Grid */}
			<div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
				<div className="min-w-[960px]">
					{/* Header Row */}
					<div className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-neutral-200 bg-neutral-50">
						<div className="p-3 text-xs font-semibold uppercase tracking-wide text-neutral-500" />
						{weekDays.map((day, i) => {
							const isToday = day.isSame(today, "day");
							return (
								<div
									key={DAY_LABELS[i]}
									className={cn(
										"border-l border-neutral-200 px-3 py-2.5 text-center",
										isToday && "bg-primary/5",
									)}
								>
									<div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
										{DAY_LABELS[i]}
									</div>
									<div
										className={cn(
											"mt-0.5 text-xl font-bold",
											isToday ? "text-primary" : "text-neutral-900",
										)}
									>
										{day.date()}
									</div>
								</div>
							);
						})}
					</div>

					{/* Unassigned Shifts Section */}
					{unassignedByDay.size > 0 && (
						<div className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-neutral-200">
							<div className="flex items-start p-3">
								<span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-600">
									Óráðstafað
								</span>
							</div>
							{weekDays.map((day, i) => {
								const dayShifts = unassignedByDay.get(i) ?? [];
								const isToday = day.isSame(today, "day");
								return (
									<div
										key={DAY_LABELS[i]}
										className={cn(
											"space-y-1.5 border-l border-neutral-200 p-2",
											isToday && "bg-primary/5",
										)}
									>
										{dayShifts.map((shift) => (
											<ShiftBlock key={shift.id} shift={shift} />
										))}
									</div>
								);
							})}
						</div>
					)}

					{/* Employee Rows */}
					{employees.length === 0 && weekShifts.length === 0 ? (
						<div className="px-6 py-16 text-center text-neutral-400">
							Engar vaktir eða starfsmenn fundust fyrir þessa viku.
						</div>
					) : (
						employees.map((employee) => {
							const totalMinutes = getEmployeeWeekMinutes(employee.id);
							const empShifts = shiftsByEmployeeAndDay.get(employee.id);

							return (
								<div
									key={employee.id}
									className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50/40 transition-colors"
								>
									{/* Employee Info */}
									<div className="flex flex-col justify-center p-3">
										<span className="text-sm font-semibold text-neutral-900 truncate">
											{employee.name}
										</span>
										<span className="mt-0.5 text-xs text-neutral-400">
											{totalMinutes > 0
												? formatDuration(totalMinutes)
												: "0h"}
										</span>
									</div>

									{/* Day Cells */}
									{weekDays.map((day, i) => {
										const dayShifts = empShifts?.get(i) ?? [];
										const isToday = day.isSame(today, "day");
										return (
											<div
												key={DAY_LABELS[i]}
												className={cn(
													"min-h-[72px] space-y-1.5 border-l border-neutral-100 p-2",
													isToday && "bg-primary/5",
												)}
											>
												{dayShifts.map((shift) => (
													<ShiftBlock key={shift.id} shift={shift} />
												))}
											</div>
										);
									})}
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}

function ShiftBlock({ shift }: { shift: Shift }) {
	const color = getShiftColor(shift.title);
	const dur = durationMinutes(shift.start_time, shift.end_time);

	return (
		<div
			className={cn(
				"rounded-md px-2 py-1.5 text-[11px] leading-tight shadow-sm",
				color.bg,
				color.text,
			)}
		>
			<div className="font-semibold">
				{formatShiftTime(shift.start_time)} - {formatShiftTime(shift.end_time)}
				<span className="ml-1 font-normal opacity-80">
					· {formatDuration(dur)}
				</span>
			</div>
			<div className="mt-0.5 truncate font-medium opacity-90">
				{shift.title}
			</div>
		</div>
	);
}
