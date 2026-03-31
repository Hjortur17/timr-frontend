import { NextResponse } from "next/server";
import { type ApiError, api } from "@/utils/api";

export async function GET(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const response = await api.get("/api/employee/clock-entries", {
      headers: { Authorization: authorization },
      params: Object.fromEntries(searchParams),
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
