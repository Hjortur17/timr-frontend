import { NextResponse } from "next/server";
import { type ApiError, api } from "@/utils/api";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const { id } = await params;

  let body = {};
  try {
    body = await request.json();
  } catch {
    // no body is fine
  }

  try {
    const response = await api.delete(`/api/manager/shifts/${id}`, {
      headers: { Authorization: authorization },
      data: body,
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const response = await api.put(`/api/manager/shifts/${id}`, body, {
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
