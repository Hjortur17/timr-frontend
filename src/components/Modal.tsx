import {
	Dialog as DialogComponent,
	DialogBackdrop,
	DialogPanel,
} from "@headlessui/react";

export default function Modal({
	open,
	onClose,
	children,
	onConfirm,
	onCancel,
	hideButtons,
	buttonTextConfirm = "Halda áfram",
	buttonTextCancel = "Hætta við",
}: {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
	onConfirm?: () => void;
	onCancel?: () => void;
	hideButtons?: boolean;
	buttonTextConfirm?: string;
	buttonTextCancel?: string;
}) {
	return (
		<DialogComponent open={open} onClose={onClose} className="relative z-100">
			<DialogBackdrop
				transition
				className="fixed inset-0 z-100 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
			/>

			<div className="fixed inset-0 z-100 w-screen overflow-y-auto">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<DialogPanel
						transition
						className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
					>
						<div className="sm:flex sm:items-start">{children}</div>

						{!hideButtons && (
							<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
								<button
									type="button"
									onClick={onConfirm}
									className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto bg-primary hover:bg-primary/90"
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
						)}
					</DialogPanel>
				</div>
			</div>
		</DialogComponent>
	);
}
