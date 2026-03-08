import { api, type ApiError } from "@/utils/api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return NextResponse.json(
      { message: "Unauthenticated." },
      { status: 401 },
    );
  }

  try {
    const response = await api.get("/api/auth/user", {
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
