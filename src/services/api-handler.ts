import axios from "axios";

interface AxiosOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any | null;
  [key: string]: any;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

axios.defaults.withCredentials = true;

export async function apiHandler<T = any>(
  path: string,
  { method = "GET", headers = {}, body = null, ...otherOptions }: AxiosOptions = {}
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  try {
    const response = await axios({
      url: `${BASE_URL}${path}`,
      method,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      data: body,
      withCredentials: true,
      ...otherOptions,
    });

    return response.data as T;
  } catch (error: any) {
    if (error.response) {
      throw {
        status: error.response.status,
        message:
          error.response.data?.error ||
          error.response.data?.message ||
          "An error occurred",
      };
    }
    throw new Error(error.message || "Network error");
  }
}
