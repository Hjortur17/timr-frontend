"use client";

import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useLocale } from "next-intl";
import type React from "react";
import type { DayPicker, DayPickerLocale } from "react-day-picker";
import { enUS, is } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DAY_PICKER_LOCALES: Record<string, DayPickerLocale> = { is, en: enUS };

type CalendarProps = Omit<React.ComponentProps<typeof DayPicker>, "mode" | "selected" | "onSelect">;

export function DatePicker({
  value,
  onChange,
  placeholder,
  id,
  locale: localeProp,
  ...calendarProps
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  locale?: DayPickerLocale;
  id?: string;
} & CalendarProps) {
  const currentLocale = useLocale();
  const locale = localeProp ?? DAY_PICKER_LOCALES[currentLocale] ?? is;
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            className={cn("w-full justify-start font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? dayjs(value).format("D. MMMM YYYY") : <span>{placeholder}</span>}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          defaultMonth={value}
          locale={locale}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}
