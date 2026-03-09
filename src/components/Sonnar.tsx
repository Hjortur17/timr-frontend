"use client";

import {
	ArrowPathIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	return (
		<Sonner
			theme="light"
			className="toaster group"
			position="top-center"
			icons={{
				success: <CheckCircleIcon className="size-4" />,
				info: <InformationCircleIcon className="size-4" />,
				warning: <ExclamationTriangleIcon className="size-4" />,
				error: <XCircleIcon className="size-4" />,
				loading: <ArrowPathIcon className="size-4 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "#ffffff",
					"--normal-text": "oklch(14.5% 0 0)",
					"--normal-border": "#e5e5e5",
					"--success-bg": "rgb(200, 232, 227)",
					"--success-text": "rgb(10, 124, 104)",
					"--error-bg": "#fef2f2",
					"--error-text": "#dc2626",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
