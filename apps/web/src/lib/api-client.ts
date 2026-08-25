const API_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:4001';

/**
 * Make an unauthenticated request from the browser (Client Components).
 * Clerk session tokens are not available in 'use client' modules.
 * The Express API should verify the JWT from the Authorization header if needed,
 * or this client can be extended to pass a token from a client-side Clerk hook.
 */
async function clientFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const apiClient = {
  get: <T>(path: string) => clientFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    clientFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    clientFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => clientFetch<T>(path, { method: 'DELETE' }),
};
