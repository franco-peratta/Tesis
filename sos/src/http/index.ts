type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

const domain = "http://localhost:5000/api/v1"

interface HttpOptions {
  headers?: Record<string, string>
  params?: Record<string, any>
}

export async function http<T>(
  method: HttpMethod,
  url: string,
  options?: HttpOptions
): Promise<Response<T>> {
  const {
    headers = {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    params = {}
  } = options || {}

  const fetchOptions: RequestInit = {
    method,
    headers
  }

  if (method === "GET" && Object.keys(params).length > 0) {
    const urlParams = new URLSearchParams(params)
    url += `?${urlParams.toString()}`
  }

  if (["POST", "PUT", "PATCH"].includes(method)) {
    fetchOptions.body = JSON.stringify(params)
  }

  const response = await fetch(`${domain}${url}`, fetchOptions)

  if (!response.ok) {
    const errorBody = await response.json()
    const errorMessage =
      errorBody.msg || errorBody.message || "Ocurrio un error inesperado"

    throw new Error(errorMessage)
  }

  const responseBody = (await response.json()) as Response<T>

  return responseBody
}

interface Response<T> {
  data: T
  message?: string
}
