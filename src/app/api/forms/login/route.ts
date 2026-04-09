import { NextResponse } from "next/server";
import { loginFormSchema } from "@/types/forms";
import { type ApiError, api } from "@/utils/api";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, remember } = loginFormSchema.parse(body);

  try {
    const response = await api.post("/api/auth/login", { email, password, remember });

    const res = NextResponse.json(response.data, { status: response.status });
    res.cookies.set("auth_token", response.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    });
    if (response.data.data?.locale) {
      res.cookies.set("NEXT_LOCALE", response.data.data.locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return res;
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message, errors: apiError.errors },
      { status: apiError.status ?? 500 },
    );
  }
}
