import axios, { type AxiosError } from "axios";

export interface ApiError extends Error {
  status?: number;
  errors?: Record<string, string[]>;
}

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const apiError: ApiError = new Error(error.response?.data?.message ?? error.message) as ApiError;

    apiError.status = error.response?.status;
    apiError.errors = error.response?.data?.errors;

    return Promise.reject(apiError);
  },
);
