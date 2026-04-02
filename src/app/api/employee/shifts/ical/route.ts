import { type ApiError, api } from "@/utils/api";

export async function GET(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization) {
    return new Response(JSON.stringify({ message: "Unauthenticated." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await api.get("/api/employee/shifts/ical", {
      headers: { Authorization: authorization },
      responseType: "text",
    });

    return new Response(response.data, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=UTF-8",
        "Content-Disposition": "attachment; filename=vaktir.ics",
      },
    });
  } catch (error) {
    const apiError = error as ApiError;
    return new Response(JSON.stringify({ message: apiError.message }), {
      status: apiError.status ?? 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
