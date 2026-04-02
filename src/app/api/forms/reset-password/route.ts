import { NextResponse } from "next/server";
import { resetPasswordFormSchema } from "@/types/forms";
import { type ApiError, api } from "@/utils/api";

export async function POST(request: Request) {
  const body = await request.json();
  const data = resetPasswordFormSchema.parse(body);

  try {
    const response = await api.post("/api/auth/reset-password", data);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message, errors: apiError.errors },
      { status: apiError.status ?? 500 },
    );
  }
}
