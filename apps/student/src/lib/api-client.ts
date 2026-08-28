const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

let tokenGetter: (() => Promise<string | null>) | null = null;

export function registerTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

async function getHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (tokenGetter) {
    const token = await tokenGetter();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const apiClient = {
  async get<T = unknown>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { headers: await getHeaders() });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST', headers: await getHeaders(), body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
  async patch<T = unknown>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH', headers: await getHeaders(), body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
  async delete<T = unknown>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: await getHeaders() });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};
