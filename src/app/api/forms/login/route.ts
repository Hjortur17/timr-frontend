import { loginFormSchema } from "@/types/forms";
import { api, type ApiError } from "@/utils/api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = loginFormSchema.parse(body);

  try {
    const response = await api.post("/api/auth/login", { email, password });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message, errors: apiError.errors },
      { status: apiError.status ?? 500 },
    );
  }
}
