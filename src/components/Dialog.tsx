import { cn } from "@/utils/classname";
import {
	Dialog as DialogComponent,
	DialogBackdrop,
	DialogTitle,
	DialogPanel,
} from "@headlessui/react";
import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function Dialog({
	open,
	onClose,
	variant,
	title,
	description,
	onConfirm,
	onCancel,
	buttonTextConfirm = "Halda áfram",
	buttonTextCancel = "Hætta við",
}: {
	open: boolean;
	onClose: () => void;
	variant: "danger" | "warning" | "info" | "success";
	title: string;
	description: string;
	onConfirm: () => void;
	onCancel: () => void;
	buttonTextConfirm: string;
	buttonTextCancel: string;
}) {
	const icon = {
		danger: <ExclamationTriangleIcon className="size-6 text-red-600" />,
		warning: <ExclamationTriangleIcon className="size-6 text-yellow-600" />,
		info: <InformationCircleIcon className="size-6 text-blue-600" />,
		success: <CheckCircleIcon className="size-6 text-primary" />,
	};

	return (
		<DialogComponent open={open} onClose={onClose} className="relative z-[100]">
			<DialogBackdrop
				transition
				className="fixed inset-0 z-[100] bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
			/>

			<div className="fixed inset-0 z-[100] w-screen overflow-y-auto">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<DialogPanel
						transition
						className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
					>
						<div className="sm:flex sm:items-start">
							<div
								className={cn(
									"mx-auto flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:size-10",
									variant === "danger" && "bg-red-100",
									variant === "warning" && "bg-yellow-100",
									variant === "info" && "bg-blue-100",
									variant === "success" && "bg-secondary",
								)}
							>
								{icon[variant as keyof typeof icon]}
							</div>
							<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
								<DialogTitle
									as="h3"
									className="text-base font-semibold text-gray-900"
								>
									{title}
								</DialogTitle>
								<div className="mt-2">
									<p className="text-sm text-gray-500">{description}</p>
								</div>
							</div>
						</div>
						<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
							<button
								type="button"
								onClick={onConfirm}
								className={cn(
									"inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto",
									variant === "danger" && "bg-red-600 hover:bg-red-500",
									variant === "warning" && "bg-yellow-600 hover:bg-yellow-500",
									variant === "info" && "bg-blue-600 hover:bg-blue-500",
									variant === "success" && "bg-primary hover:bg-primary/90",
								)}
							>
								{buttonTextConfirm}
							</button>
							<button
								type="button"
								data-autofocus
								onClick={onCancel}
								className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							>
								{buttonTextCancel}
							</button>
						</div>
					</DialogPanel>
				</div>
			</div>
		</DialogComponent>
	);
}
