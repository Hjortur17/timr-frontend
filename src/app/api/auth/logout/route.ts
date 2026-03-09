import { NextResponse } from "next/server";
import { type ApiError, api } from "@/utils/api";

export async function POST(request: Request) {
  const authorization = request.headers.get("Authorization");

  const res = NextResponse.json({ message: "Logged out." });
  res.cookies.delete("auth_token");

  if (!authorization) {
    return res;
  }

  try {
    await api.post("/api/auth/logout", null, {
      headers: { Authorization: authorization },
    });
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message, errors: apiError.errors },
      { status: apiError.status ?? 500 },
    );
  }

  return res;
}
