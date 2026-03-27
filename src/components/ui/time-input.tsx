import * as React from "react";

import { cn } from "@/lib/utils";

function parseDigits(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/\D/g, "").slice(0, 4);
}

function formatTime(digits: string): string {
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidDigitAt(digits: string, digit: string): boolean {
  const pos = digits.length;
  const d = Number(digit);

  if (pos === 0) return d <= 2;
  if (pos === 1) {
    const h = Number(digits[0]) * 10 + d;
    return h <= 23;
  }
  if (pos === 2) return d <= 5;
  if (pos === 3) return true;
  return false;
}

const TimeInput = React.forwardRef<HTMLInputElement, Omit<React.ComponentProps<"input">, "type">>(
  ({ className, value, onChange, onBlur, ...props }, ref) => {
    const [digits, setDigits] = React.useState(() => parseDigits(value as string));

    React.useEffect(() => {
      setDigits(parseDigits(value as string));
    }, [value]);

    function fireChange(newDigits: string) {
      setDigits(newDigits);
      const formatted = formatTime(newDigits);
      if (onChange) {
        const event = {
          target: { value: formatted, name: props.name },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === "Backspace") {
        e.preventDefault();
        fireChange(digits.slice(0, -1));
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        if (digits.length >= 4) return;
        if (!isValidDigitAt(digits, e.key)) return;
        fireChange(digits + e.key);
        return;
      }
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
      e.preventDefault();
      const pasted = parseDigits(e.clipboardData.getData("text"));
      if (!pasted) return;

      let valid = "";
      for (const ch of pasted) {
        if (valid.length >= 4) break;
        if (isValidDigitAt(valid, ch)) {
          valid += ch;
        }
      }
      fireChange(valid);
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      if (digits.length > 0 && digits.length < 4) {
        const padded = digits.padEnd(4, "0");
        fireChange(padded);
      }
      if (onBlur) {
        onBlur(e);
      }
    }

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={5}
        value={formatTime(digits)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        onChange={() => {}}
        className={cn(
          "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          className,
        )}
        {...props}
      />
    );
  },
);

TimeInput.displayName = "TimeInput";

export { TimeInput };
