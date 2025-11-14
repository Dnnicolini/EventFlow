import { apiFetch, apiFetchRaw } from '@/lib/api';

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { name: string; email: string; password: string; password_confirmation?: string };

// Adjust endpoints to match your Laravel API routes
export async function login(payload: LoginPayload) {
  const { data, response } = await apiFetchRaw<{ token?: string; access_token?: string; data?: any; [k: string]: any }>('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  // Try to read token from body or headers
  const headerAuth = response.headers.get('authorization') || response.headers.get('Authorization') || '';
  const headerToken = headerAuth.toLowerCase().startsWith('bearer ') ? headerAuth.slice(7) : null;

  const token =
    (data as any)?.token ||
    (data as any)?.access_token ||
    (data as any)?.data?.token ||
    (data as any)?.data?.access_token ||
    headerToken ||
    null;

  return { ...data, token };
}

export async function register(payload: RegisterPayload) {
  const { data, response } = await apiFetchRaw<{ token?: string; access_token?: string; data?: any; [k: string]: any }>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const headerAuth = response.headers.get('authorization') || response.headers.get('Authorization') || '';
  const headerToken = headerAuth.toLowerCase().startsWith('bearer ') ? headerAuth.slice(7) : null;

  const token =
    (data as any)?.token ||
    (data as any)?.access_token ||
    (data as any)?.data?.token ||
    (data as any)?.data?.access_token ||
    headerToken ||
    null;

  return { ...data, token };
}

export async function getCurrentUser() {
  const res = await apiFetch<{ data: { name: string; email: string; created_at?: string } }>('/me', { method: 'GET' });
  return (res as any)?.data ?? res;
}
