import { NextResponse } from "next/server";
import { forgotPasswordFormSchema } from "@/types/forms";
import { type ApiError, api } from "@/utils/api";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = forgotPasswordFormSchema.parse(body);

  try {
    const response = await api.post("/api/auth/forgot-password", { email });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message, errors: apiError.errors },
      { status: apiError.status ?? 500 },
    );
  }
}
