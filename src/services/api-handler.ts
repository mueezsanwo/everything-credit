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
    // Preserve the FULL data object from the backend
    const responseData = error.response.data || {};

    throw {
      status: error.response.status,
      message:
        responseData.error ||
        responseData.message ||
        "An error occurred",
      // Add these so frontend can access the real details
      data: responseData,                // ← the full JSON body
      details: responseData.details,     // optional shortcut
    };
  }

  // Network-level error (no response)
  throw {
    status: null,
    message: error.message || "Network error",
    data: null,
  };
}
}
