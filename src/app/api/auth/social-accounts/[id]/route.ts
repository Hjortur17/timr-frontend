import { type NextRequest, NextResponse } from "next/server";
import { type ApiError, api } from "@/utils/api";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const response = await api.delete(`/api/auth/social-accounts/${id}`, {
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
