import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/is";
import { useLocale } from "next-intl";

export function useDayjsLocale() {
  const locale = useLocale();
  // Set synchronously during render so dayjs.format() calls
  // in the same render cycle use the correct locale.
  dayjs.locale(locale);
}
