"use client";

import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

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
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent showCloseButton={false}>
        <div className="sm:flex sm:items-start">{children}</div>

        {!hideButtons && (
          <DialogFooter>
            <button
              type="button"
              onClick={onCancel}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              {buttonTextCancel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto bg-primary hover:bg-primary/90"
            >
              {buttonTextConfirm}
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
