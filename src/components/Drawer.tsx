import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Drawer({
	open,
	onClose,
	title,
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<Dialog open={open} onClose={onClose} className="relative z-100">
			<div className="fixed inset-0" />

			<DialogBackdrop
				transition
				className="fixed inset-0 bg-neutral-100/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
			/>

			<div className="fixed inset-0 overflow-hidden">
				<div className="absolute inset-0 overflow-hidden">
					<div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
						<DialogPanel
							transition
							className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
						>
							<div className="relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl">
								<div className="px-4 sm:px-6">
									<div className="flex items-start justify-between">
										<DialogTitle className="text-base font-semibold">
											{title}
										</DialogTitle>
										<div className="ml-3 flex h-7 items-center">
											<button
												type="button"
												onClick={onClose}
												className="relative rounded-md text-neutral-400 hover:text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
											>
												<span className="absolute -inset-2.5" />
												<span className="sr-only">Close panel</span>
												<XMarkIcon aria-hidden className="size-6" />
											</button>
										</div>
									</div>
								</div>
								<div className="relative mt-6 flex-1 px-4 sm:px-6">
									{children}
								</div>
							</div>
						</DialogPanel>
					</div>
				</div>
			</div>
		</Dialog>
	);
}
