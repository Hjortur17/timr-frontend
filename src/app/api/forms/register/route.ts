import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { registerFormSchema } from "@/types/forms";
import { type ApiError, api } from "@/utils/api";

export async function POST(request: Request) {
  const body = await request.json();

  let parsed: ReturnType<typeof registerFormSchema.parse>;
  try {
    parsed = registerFormSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string[]> = {};
      for (const issue of error.issues) {
        const field = issue.path.join(".");
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json({ message: "Validation failed", errors }, { status: 422 });
    }
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const { name, email, password, password_confirmation, invite_token } = parsed;

  try {
    const response = await api.post("/api/auth/register", {
      name,
      email,
      password,
      password_confirmation,
      ...(invite_token ? { invite_token } : {}),
    });

    const res = NextResponse.json(response.data, { status: response.status });
    res.cookies.set("auth_token", response.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
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
