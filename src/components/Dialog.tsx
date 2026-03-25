"use client";

import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/utils/classname";

const VARIANT_CONFIG = {
  danger: {
    icon: <TriangleAlert className="size-6 text-red-600" />,
    mediaBg: "bg-red-100",
    buttonClass: "bg-red-600 hover:bg-red-500 text-white",
  },
  warning: {
    icon: <TriangleAlert className="size-6 text-yellow-600" />,
    mediaBg: "bg-yellow-100",
    buttonClass: "bg-yellow-600 hover:bg-yellow-500 text-white",
  },
  info: {
    icon: <Info className="size-6 text-blue-600" />,
    mediaBg: "bg-blue-100",
    buttonClass: "bg-blue-600 hover:bg-blue-500 text-white",
  },
  success: {
    icon: <CircleCheck className="size-6 text-primary" />,
    mediaBg: "bg-secondary",
    buttonClass: "bg-primary hover:bg-primary/90 text-white",
  },
};

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
  const config = VARIANT_CONFIG[variant];

  return (
    <AlertDialog open={open} onOpenChange={(value) => !value && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className={config.mediaBg}>{config.icon}</AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{buttonTextCancel}</AlertDialogCancel>
          <AlertDialogAction className={cn(config.buttonClass)} onClick={onConfirm}>
            {buttonTextConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
