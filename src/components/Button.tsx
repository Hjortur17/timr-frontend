import { cn } from "@/utils/classname";

export default function Button({
	children,
	type,
	onClick,
	className,
}: {
	children: React.ReactNode;
	type: "button" | "submit" | "reset";
	onClick?: () => void;
	className?: string;
}) {
	return (
		<button
			type={type}
			{...(onClick && { onClick })}
			className={cn(
				"flex w-full h-12 items-center justify-center rounded-lg bg-primary px-3 py-1.5 font-extrabold tracking-wide text-white hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors duration-200",
				className,
			)}
		>
			{children}
		</button>
	);
}
