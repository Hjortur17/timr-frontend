export default function ProgressBar({
	steps,
	currentStep,
}: {
	steps: {
		id: string;
		name: string;
		href: string;
		status: "complete" | "current" | "upcoming";
	}[];
	currentStep: number;
}) {
	return (
		<div className="px-4 py-12 sm:px-6 lg:px-8">
			<nav aria-label="Progress" className="flex justify-center">
				<ol className="space-y-6">
					{steps.map((step) => (
						<li key={step.name}>
							{step.status === "complete" ? (
								<a href={step.href} className="group">
									<span className="flex items-start">
										<span className="relative flex size-5 shrink-0 items-center justify-center">
											{/* <CheckCircleIcon
												aria-hidden="true"
												className="size-full text-primary group-hover:text-indigo-800"
											/> */}
										</span>
										<span className="ml-3 text-sm font-medium text-neutral-500 group-hover:text-neutral-900">
											{step.name}
										</span>
									</span>
								</a>
							) : step.status === "current" ? (
								<a
									href={step.href}
									aria-current="step"
									className="flex items-start"
								>
									<span
										aria-hidden="true"
										className="relative flex size-5 shrink-0 items-center justify-center"
									>
										<span className="absolute size-4 rounded-full bg-secondary" />
										<span className="relative block size-2 rounded-full bg-primary" />
									</span>
									<span className="ml-3 text-sm font-bold">{step.name}</span>
								</a>
							) : (
								<a href={step.href} className="group">
									<div className="flex items-start">
										<div
											aria-hidden="true"
											className="relative flex size-5 shrink-0 items-center justify-center"
										>
											<div className="size-2 rounded-full bg-neutral-300 group-hover:bg-neutral-400" />
										</div>
										<p className="ml-3 text-sm font-medium text-neutral-500 group-hover:text-neutral-900">
											{step.name}
										</p>
									</div>
								</a>
							)}
						</li>
					))}
				</ol>
			</nav>
		</div>
	);
}
