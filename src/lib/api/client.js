export class ApiClientError extends Error {
  constructor(message, { status = 500, code = "REQUEST_FAILED" } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiClientError("We couldn’t reach the service. Check your connection and try again.", { status: 0, code: "NETWORK_ERROR" });
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false || !payload) {
    throw new ApiClientError(payload?.message || "Something went wrong. Please try again.", {
      status: response.status,
      code: payload?.error || "REQUEST_FAILED",
    });
  }
  return payload;
}

export function apiUrl(path, query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const suffix = params.toString();
  return suffix ? `${path}?${suffix}` : path;
}
