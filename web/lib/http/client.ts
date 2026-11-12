/**
 * Browser-side helper for the `{ error: { code, message } }` envelope used by the API routes.
 * Reads the body defensively: a non-JSON response (for example an HTML 500 page) must surface
 * as a server error, not as "could not reach Edupilo".
 */
export async function readApiResponse<T>(
  response: Response,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (response.ok && body !== null) return { ok: true, data: body as T };
  const message =
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error?: { message?: unknown } }).error?.message === "string"
      ? (body as { error: { message: string } }).error.message
      : response.status === 429
        ? "Too many attempts. Please wait a moment and try again."
        : "Something went wrong on our side. Please try again.";
  return { ok: false, message };
}

export const NETWORK_ERROR_MESSAGE =
  "Could not reach Edupilo. Check your connection and try again.";
