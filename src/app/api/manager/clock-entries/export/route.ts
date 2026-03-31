import { NextResponse } from "next/server";
import { type ApiError, api } from "@/utils/api";

export async function GET(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const response = await api.get("/api/manager/clock-entries/export", {
      headers: { Authorization: authorization },
      params: Object.fromEntries(searchParams),
      responseType: "arraybuffer",
    });

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": response.headers["content-disposition"] ?? "attachment; filename=timaskraning.xlsx",
      },
    });
  } catch (error) {
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message, errors: apiError.errors },
      { status: apiError.status ?? 500 },
    );
  }
}
