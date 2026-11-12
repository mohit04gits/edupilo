import { AiProviderError } from "./contracts";
export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;
export const PROVIDER_TIMEOUT_MS = 90_000;
export async function postJson(
  provider: string,
  url: string,
  headers: Record<string, string>,
  body: unknown,
  fetcher: FetchLike,
  signal?: AbortSignal,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetcher(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      // Bound every provider call so a hung request cannot block planning indefinitely.
      signal: signal ?? AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });
  } catch {
    throw new AiProviderError({
      provider,
      operation: "structured-generation",
      safeCode: "NETWORK_ERROR",
      retryable: true,
    });
  }
  if (!response.ok)
    throw new AiProviderError({
      provider,
      operation: "structured-generation",
      safeCode: `HTTP_${response.status}`,
      retryable: response.status === 429 || response.status >= 500,
      retryAfterMs: Number(response.headers.get("retry-after") || 0) * 1000 || undefined,
    });
  try {
    return await response.json();
  } catch {
    throw new AiProviderError({
      provider,
      operation: "structured-generation",
      safeCode: "INVALID_JSON",
      retryable: false,
    });
  }
}
