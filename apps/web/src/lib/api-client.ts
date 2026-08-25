/**
 * Client-side API helper for browser (Client Components).
 *
 * Clerk session tokens are fetched via a `getToken` callback passed
 * from the `useAuth()` hook.  The token is sent as a Bearer header
 * so the Express API's authMiddleware can verify it.
 */

const API_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:4001';

// Module-level token getter — set once by the Providers component
let _getToken: (() => Promise<string | null>) | null = null;

/**
 * Register the Clerk `getToken` function so all apiClient calls
 * automatically include the user's JWT.
 * Call this once in a top-level provider (e.g. AuthTokenProvider).
 */
export function registerTokenGetter(getToken: () => Promise<string | null>) {
  _getToken = getToken;
}

async function clientFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  // Attach Clerk JWT if available
  if (_getToken) {
    const token = await _getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

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
