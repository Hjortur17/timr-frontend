import { NextResponse } from "next/server";
import { type ApiError, api } from "@/utils/api";

export async function GET(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const response = await api.get("/api/manager/shift-templates", {
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

export async function POST(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const body = await request.json();

  try {
    const response = await api.post("/api/manager/shift-templates", body, {
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
