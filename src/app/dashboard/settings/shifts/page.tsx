"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Shift,
	ShiftDeletionPreview,
	ShiftForm,
	shiftFormSchema,
} from "@/types/forms";
import { authHeaders } from "@/utils/auth";

export default function ShiftsPage() {
	const t = useTranslations();
	const [shifts, setShifts] = useState<Shift[]>([]);

	const [formKey, setFormKey] = useState(0);

	const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
	const [openEditDrawer, setOpenEditDrawer] = useState(false);
	const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [deletionPreview, setDeletionPreview] =
		useState<ShiftDeletionPreview | null>(null);
	const [loadingPreview, setLoadingPreview] = useState(false);
	const [replacementShiftId, setReplacementShiftId] = useState<string>("");

	const onCreated = (shift: Shift) => {
		setShifts((prev) => [...prev, shift]);
		setFormKey((k) => k + 1);
		setOpenCreateDrawer(false);
	};

	const onUpdated = (shift: Shift) => {
		setShifts((prev) => prev.map((s) => (s.id === shift.id ? shift : s)));
		setFormKey((k) => k + 1);
		setSelectedShift(null);
		setOpenEditDrawer(false);
	};

	const onOpenEditDrawer = (shift: Shift) => {
		setSelectedShift(shift);
		setOpenEditDrawer(true);
	};

	const onOpenDeleteDialog = async (shift: Shift) => {
		setSelectedShift(shift);
		setShowDeleteDialog(true);
		setDeletionPreview(null);
		setReplacementShiftId("");
		setLoadingPreview(true);

		try {
			const res = await axios.get(
				`/api/manager/shifts/${shift.id}/deletion-preview`,
				{ headers: authHeaders() },
			);
			setDeletionPreview(res.data.data);
		} catch {
			toast.error(t("shifts.couldNotFetchShift"));
			setShowDeleteDialog(false);
			setSelectedShift(null);
		} finally {
			setLoadingPreview(false);
		}
	};

	const closeDeleteDialog = () => {
		setShowDeleteDialog(false);
		setSelectedShift(null);
		setDeletionPreview(null);
		setReplacementShiftId("");
	};

	const deleteShift = async (shift: Shift) => {
		await axios.delete(`/api/manager/shifts/${shift.id}`, {
			headers: { ...authHeaders(), "Content-Type": "application/json" },
			data: replacementShiftId
				? { replacement_shift_id: Number(replacementShiftId) }
				: {},
		});
		setShifts((prev) => prev.filter((s) => s.id !== shift.id));
		closeDeleteDialog();
		toast.success(t("shifts.shiftDeleted"));
	};

	useEffect(() => {
		axios
			.get("/api/manager/shifts", { headers: authHeaders() })
			.then((res) => setShifts(res.data.data ?? []))
			.catch(console.error);
	}, []);

	return (
		<div className="px-4 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
				<div>
					<h1 className="text-2xl/9 font-bold tracking-tight text-foreground">
						{t("shifts.title")}
					</h1>
					<p className="mt-2 text-sm/6 text-muted-foreground">
						{t("shifts.description")}
					</p>
				</div>

				<Button
					type="button"
					size="lg"
					onClick={() => setOpenCreateDrawer(true)}
				>
					{t("shifts.addShift")}
				</Button>
			</div>

			<section className="mt-6">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="py-3.5 pr-3 pl-4 sm:pl-3">
								{t("common.name")}
							</TableHead>
							<TableHead className="px-3 py-3.5">
								{t("shifts.startTime")}
							</TableHead>
							<TableHead className="px-3 py-3.5">
								{t("shifts.endTime")}
							</TableHead>
							<TableHead className="px-3 py-3.5">{t("shifts.notes")}</TableHead>
							<TableHead className="py-3.5 pr-4 pl-3 sm:pr-3">
								<span className="sr-only">{t("common.actions")}</span>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{shifts.map((shift) => (
							<TableRow key={shift.id} className="even:bg-muted/30">
								<TableCell className="py-4 pr-3 pl-4 font-medium sm:pl-3">
									{shift.title}
								</TableCell>
								<TableCell className="px-3 py-4 text-muted-foreground">
									{shift.start_time?.slice(0, 5) ?? "–"}
								</TableCell>
								<TableCell className="px-3 py-4 text-muted-foreground">
									{shift.end_time?.slice(0, 5) ?? "–"}
								</TableCell>
								<TableCell className="px-3 py-4 text-muted-foreground">
									{shift.notes ?? "–"}
								</TableCell>
								<TableCell className="flex justify-end gap-2 py-4 pr-4 pl-3 sm:pr-3">
									<button
										type="button"
										onClick={() => onOpenDeleteDialog(shift)}
									>
										<Trash2 className="size-5 text-neutral-500 hover:text-red-700 duration-200 transition-colors cursor-pointer" />
									</button>
									<Button
										type="button"
										variant="secondary"
										size="sm"
										onClick={() => onOpenEditDrawer(shift)}
									>
										{t("common.edit")}
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</section>

			<Sheet
				open={openCreateDrawer}
				onOpenChange={(value) => !value && setOpenCreateDrawer(false)}
			>
				<SheetContent side="right" className="sm:max-w-md overflow-y-auto">
					<SheetHeader>
						<SheetTitle>{t("shifts.addShift")}</SheetTitle>
					</SheetHeader>
					<div className="px-4">
						<CreateShiftForm key={formKey} onCreated={onCreated} />
					</div>
				</SheetContent>
			</Sheet>

			<Sheet
				open={openEditDrawer}
				onOpenChange={(value) => !value && setOpenEditDrawer(false)}
			>
				<SheetContent side="right" className="sm:max-w-md overflow-y-auto">
					<SheetHeader>
						<SheetTitle>{t("shifts.editShift")}</SheetTitle>
					</SheetHeader>
					<div className="px-4">
						{selectedShift && (
							<EditShiftForm
								key={formKey}
								shift={selectedShift}
								onUpdated={onUpdated}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>

			<Dialog
				open={showDeleteDialog}
				onOpenChange={(open) => !open && closeDeleteDialog()}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("shifts.deleteShift")}</DialogTitle>
						{selectedShift && (
							<DialogDescription>
								{t("shifts.deleteShiftConfirm", { name: selectedShift.title })}
							</DialogDescription>
						)}
					</DialogHeader>

					{loadingPreview ? (
						<div className="flex justify-center py-6">
							<Loader2 className="size-6 animate-spin text-muted-foreground" />
						</div>
					) : deletionPreview ? (
						<div className="space-y-4 text-sm">
							{deletionPreview.total_assignments > 0 ? (
								<p className="text-muted-foreground">
									{t("shifts.scheduledIn")}{" "}
									<strong className="text-foreground">
										{deletionPreview.total_assignments}{" "}
										{t(
											deletionPreview.total_assignments === 1
												? "shifts.assignment"
												: "shifts.assignments",
										)}
									</strong>{" "}
									{t("shifts.forEmployee", {
										count: deletionPreview.total_employees,
									})}{" "}
									<strong className="text-foreground">
										{deletionPreview.total_employees}
									</strong>
									.
								</p>
							) : (
								<p className="text-muted-foreground">
									{t("shifts.noAssignments")}
								</p>
							)}

							{deletionPreview.future_assignments > 0 ? (
								<>
									<p className="text-muted-foreground">
										<strong className="text-foreground">
											{deletionPreview.future_assignments}{" "}
											{t(
												deletionPreview.future_assignments === 1
													? "shifts.futureAssignment"
													: "shifts.futureAssignments",
											)}
										</strong>{" "}
										{replacementShiftId
											? t("shifts.movedToReplacement")
											: t("shifts.willBeDeleted")}
									</p>

									{deletionPreview.replacement_shifts.length > 0 && (
										<div>
											<label
												htmlFor="replacement-shift"
												className="block text-sm font-medium text-foreground mb-1.5"
											>
												{t("shifts.selectReplacementShift")}
											</label>
											<select
												id="replacement-shift"
												value={replacementShiftId}
												onChange={(e) => setReplacementShiftId(e.target.value)}
												className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
											>
												<option value="">
													{t("shifts.noReplacementDelete")}
												</option>
												{deletionPreview.replacement_shifts.map((s) => (
													<option key={s.id} value={s.id}>
														{s.title} ({s.start_time.slice(0, 5)} –{" "}
														{s.end_time.slice(0, 5)})
													</option>
												))}
											</select>
										</div>
									)}
								</>
							) : deletionPreview.total_assignments > 0 ? (
								<p className="text-muted-foreground">
									{t("shifts.noFutureAssignmentsAffected")}
								</p>
							) : null}
						</div>
					) : null}

					<DialogFooter>
						<Button variant="outline" onClick={closeDeleteDialog}>
							{t("common.cancel")}
						</Button>
						<Button
							variant="destructive"
							onClick={() => selectedShift && deleteShift(selectedShift)}
							disabled={loadingPreview}
						>
							{t("shifts.deleteShift")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function EditShiftForm({
	shift,
	onUpdated,
}: {
	shift: Shift;
	onUpdated: (shift: Shift) => void;
}) {
	const t = useTranslations();
	const { register, handleSubmit } = useForm<ShiftForm>({
		resolver: zodResolver(shiftFormSchema),
		defaultValues: {
			title: shift.title,
			start_time: shift.start_time?.slice(0, 5) ?? "",
			end_time: shift.end_time?.slice(0, 5) ?? "",
			notes: shift.notes ?? "",
		},
	});

	const onSubmit = async (data: ShiftForm) => {
		const response = await axios.put(`/api/manager/shifts/${shift.id}`, data, {
			headers: authHeaders(),
		});
		onUpdated(response.data.data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div>
				<label
					htmlFor="edit-title"
					className="block text-base/7 font-semibold text-foreground"
				>
					{t("common.name")}
				</label>
				<div className="mt-2">
					<Input
						id="edit-title"
						type="text"
						placeholder={t("shifts.namePlaceholder")}
						{...register("title")}
					/>
				</div>
			</div>
			<div>
				<label
					htmlFor="edit-start"
					className="block text-base/7 font-semibold text-foreground"
				>
					{t("shifts.startTime")}
				</label>
				<div className="mt-2">
					<Input id="edit-start" type="time" {...register("start_time")} />
				</div>
			</div>
			<div>
				<label
					htmlFor="edit-end"
					className="block text-base/7 font-semibold text-foreground"
				>
					{t("shifts.endTime")}
				</label>
				<div className="mt-2">
					<Input id="edit-end" type="time" {...register("end_time")} />
				</div>
			</div>
			<div>
				<label
					htmlFor="edit-notes"
					className="block text-base/7 font-semibold text-foreground"
				>
					{t("shifts.notesOptional")}
				</label>
				<div className="mt-2">
					<Input
						id="edit-notes"
						type="text"
						placeholder={t("shifts.notesPlaceholder")}
						{...register("notes")}
					/>
				</div>
			</div>

			<Button type="submit" variant="secondary" size="lg" className="w-full">
				{t("common.update")}
			</Button>
		</form>
	);
}

function CreateShiftForm({ onCreated }: { onCreated: (shift: Shift) => void }) {
	const t = useTranslations();
	const { register, handleSubmit } = useForm<ShiftForm>({
		resolver: zodResolver(shiftFormSchema),
		defaultValues: { title: "", start_time: "", end_time: "", notes: "" },
	});

	const onSubmit = async (data: ShiftForm) => {
		const response = await axios.post("/api/manager/shifts", data, {
			headers: authHeaders(),
		});
		onCreated(response.data.data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div>
				<label
					htmlFor="create-title"
					className="block text-base/7 font-semibold text-foreground"
				>
					{t("common.name")}
				</label>
				<div className="mt-2">
					<Input
						id="create-title"
						type="text"
						placeholder={t("shifts.namePlaceholder")}
						{...register("title")}
					/>
				</div>
			</div>
			<div>
				<label
					htmlFor="create-start"
					className="block text-base/7 font-semibold text-foreground"
				>
					{t("shifts.startTime")}
				</label>
				<div className="mt-2">
					<Input id="create-start" type="time" {...register("start_time")} />
				</div>
			</div>
			<div>
				<label
					htmlFor="create-end"
					className="block text-base/7 font-semibold text-foreground"
				>
					{t("shifts.endTime")}
				</label>
				<div className="mt-2">
					<Input id="create-end" type="time" {...register("end_time")} />
				</div>
			</div>
			<div>
				<label
					htmlFor="create-notes"
					className="block text-base/7 font-semibold text-foreground"
				>
					{t("shifts.notesOptional")}
				</label>
				<div className="mt-2">
					<Input
						id="create-notes"
						type="text"
						placeholder={t("shifts.notesPlaceholder")}
						{...register("notes")}
					/>
				</div>
			</div>

			<Button type="submit" variant="secondary" size="lg" className="w-full">
				{t("shifts.addShift")}
			</Button>
		</form>
	);
}
