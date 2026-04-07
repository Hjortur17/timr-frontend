import { type NextRequest, NextResponse } from "next/server";
import { defaultLocale, type Locale, locales } from "@/i18n/config";

export async function POST(request: NextRequest) {
  const { locale } = (await request.json()) as { locale: string };

  if (!locales.includes(locale as Locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ locale });
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  return response;
}
