import { NextResponse } from "next/server";
import { type ApiError, api } from "@/utils/api";

export async function PATCH(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const body = await request.json();

  try {
    const response = await api.patch("/api/auth/password", body, {
      headers: { Authorization: authorization },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message, errors: apiError.errors },
      { status: apiError.status ?? 500 },
    );
  }
}
