type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

// @TODO use env vars
const domain = "http://localhost:5000/api/v1"

interface HttpOptions {
  headers?: Record<string, string>
  params?: Record<string, any>
}

function getTokenFromCookies(): string | undefined {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)
  return match?.[1]
}

export async function http<T>(
  method: HttpMethod,
  url: string,
  options?: HttpOptions
): Promise<Response<T>> {
  const token = getTokenFromCookies();

  const {
    headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    params = {},
  } = options || {};

  const finalHeaders: Record<string, string> = {
    ...headers,
  };

  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: finalHeaders,
  };

  if (method === "GET" && Object.keys(params).length > 0) {
    const urlParams = new URLSearchParams(params);
    url += `?${urlParams.toString()}`;
  }

  if (["POST", "PUT", "PATCH"].includes(method)) {
    fetchOptions.body = JSON.stringify(params);
  }

  const response = await fetch(`${domain}${url}`, fetchOptions);

  if (!response.ok) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = {};
    }

    const errorMessage =
      errorBody?.msg || errorBody?.message || "Ocurrió un error inesperado";

    if (response.status === 401 || response.status === 403) {
      console.error(`[HTTP ${response.status}] ${errorMessage}`, {
        url: `${domain}${url}`,
        method,
        status: response.status,
        tokenPresent: !!token,
      });

      if (response.status === 401) {
        window.location.assign("/login");
      }
    }

    throw new Error(errorMessage);
  }

  const responseBody = (await response.json()) as Response<T>;
  return responseBody;
}


interface Response<T> {
  data: T
  message?: string
}
