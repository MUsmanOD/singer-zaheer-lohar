export class ApiError extends Error {
  constructor(message, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function success(data, message, { status = 200, headers } = {}) {
  const responseHeaders = new Headers({ "Cache-Control": "private, no-store" });
  new Headers(headers).forEach((value, key) => responseHeaders.set(key, value));
  const response = Response.json({
    success: true,
    ...(message ? { message } : {}),
    data,
  }, { status, headers: responseHeaders });
  return response;
}

export function successPaginated(data, pagination, { headers } = {}) {
  const responseHeaders = new Headers({ "Cache-Control": "private, no-store" });
  new Headers(headers).forEach((value, key) => responseHeaders.set(key, value));
  return Response.json({ success: true, data, pagination }, { headers: responseHeaders });
}

export function failure(message, code = "INTERNAL_ERROR", status = 500, headers) {
  const responseHeaders = new Headers({ "Cache-Control": "private, no-store" });
  new Headers(headers).forEach((value, key) => responseHeaders.set(key, value));
  return Response.json({ success: false, message, error: code }, { status, headers: responseHeaders });
}

export function handleApiError(error) {
  if (error instanceof ApiError) return failure(error.message, error.code, error.status);
  if (error?.code === "DATABASE_NOT_CONFIGURED") {
    return failure("Application storage is not configured yet.", "DATABASE_NOT_CONFIGURED", 503);
  }
  if (error?.name === "ValidationError") {
    return failure("Some details are invalid. Review the fields and try again.", "VALIDATION_ERROR", 422);
  }
  if (error?.code === 11000) {
    return failure("This item is already in the library.", "DUPLICATE_RESOURCE", 409);
  }
  return failure("The service is temporarily unavailable. Please try again shortly.", "SERVICE_UNAVAILABLE", 503);
}

export async function readJsonBody(request, maxBytes = 64 * 1024) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiError("Send this request as JSON.", 415, "UNSUPPORTED_MEDIA_TYPE");
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > maxBytes) throw new ApiError("The request is too large.", 413, "BODY_TOO_LARGE");
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    throw new ApiError("The request is too large.", 413, "BODY_TOO_LARGE");
  }
  try {
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Expected an object.");
    return body;
  } catch {
    throw new ApiError("The request body is not valid JSON.", 400, "INVALID_JSON");
  }
}

export function ensureSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new ApiError("This request could not be verified. Reload the page and try again.", 403, "INVALID_ORIGIN");
  }
}

export function paginationFromUrl(url, defaultLimit = 20, maxLimit = 100) {
  const requestedPage = Number(url.searchParams.get("page") || 1);
  const requestedLimit = Number(url.searchParams.get("limit") || defaultLimit);
  if (!Number.isInteger(requestedPage) || requestedPage < 1 || requestedPage > 100000) {
    throw new ApiError("Page must be a positive number.", 400, "INVALID_PAGE");
  }
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > maxLimit) {
    throw new ApiError(`Limit must be between 1 and ${maxLimit}.`, 400, "INVALID_LIMIT");
  }
  return { page: requestedPage, limit: requestedLimit, skip: (requestedPage - 1) * requestedLimit };
}

export function paginationMeta({ page, limit, total }) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
