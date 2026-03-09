import { NextResponse } from "next/server";
import { loginFormSchema } from "@/types/forms";
import { type ApiError, api } from "@/utils/api";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = loginFormSchema.parse(body);

  try {
    const response = await api.post("/api/auth/login", { email, password });

    const res = NextResponse.json(response.data, { status: response.status });
    res.cookies.set("auth_token", response.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message, errors: apiError.errors },
      { status: apiError.status ?? 500 },
    );
  }
}
