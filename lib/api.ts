import { Platform } from 'react-native';
import { getToken } from './auth-storage';
import { SHOW_ERROR_DETAILS } from './env';

function normalizeBaseUrl(raw?: string) {
  if (!raw) return undefined;
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  url = url.replace(/\/$/, '');
  try {
    const u = new URL(url);
    if (Platform.OS === 'android' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '::1')) {
      u.hostname = '10.0.2.2';
      url = u.toString().replace(/\/$/, '');
    }
  } catch {}
  return url;
}
const ENV_BASE =
  normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL) ||
  normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL) ||
  normalizeBaseUrl(process.env.EXPO_PUBLIC_API);

export const API_BASE_URL = ENV_BASE || normalizeBaseUrl('http://localhost:8000/api')!;

export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE_URL.replace(/\/api$/i, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

type Options = RequestInit & { token?: string };

function joinUrl(base: string, path: string) {
  if (!path) return base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function defaultTextByStatus(status: number): string {
  switch (status) {
    case 0: return 'Falha de conexão. Verifique sua internet.';
    case 400: return 'Requisição inválida.';
    case 401: return 'Não autorizado.';
    case 403: return 'Acesso negado.';
    case 404: return 'Recurso não encontrado.';
    case 422: return 'Dados inválidos. Verifique os campos.';
    case 500: return 'Erro interno do servidor.';
    default: return 'Ocorreu um erro. Tente novamente.';
  }
}

function parseBodyMessage(body: any): string | undefined {
  if (!body) return undefined;
  if (typeof body === 'string') {
    const s = body.trim();
    return s || undefined;
  }
  if (typeof body === 'object') {
    const candidates = ['message', 'error', 'detail', 'title'] as const;
    for (const key of candidates) {
      const v = (body as any)[key];
      if (typeof v === 'string') {
        const s = v.trim();
        if (s) return s;
      }
    }
    if (body.errors && typeof body.errors === 'object') {
      const msgs: string[] = [];
      for (const v of Object.values<any>(body.errors)) {
        if (Array.isArray(v)) msgs.push(...v.map((x) => String(x)));
        else if (typeof v === 'string') msgs.push(v);
      }
      if (msgs.length) return msgs.join('\n');
    }
  }
  return undefined;
}

function extractErrorMessage(status: number, body: any): string {
  const core = parseBodyMessage(body) || defaultTextByStatus(status);
  if (SHOW_ERROR_DETAILS && body != null) {
    try {
      const raw = typeof body === 'string' ? body : JSON.stringify(body);
      const rawTrim = (raw || '').trim();
      if (rawTrim && !core.includes(rawTrim)) {
        return `${core}\n${rawTrim.substring(0, 2000)}`;
      }
    } catch {}
  }
  return core;
}

export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  let authToken: string | undefined = token ?? undefined;
  if (!authToken) {
    try {
      const t = await getToken();
      authToken = t ?? undefined;
    } catch {}
  }
  let res: Response;
  try {
    const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData;
    res = await fetch(joinUrl(API_BASE_URL, path), {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Accept-Language': 'pt-BR,pt;q=0.9',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(headers || {}),
      },
      ...rest,
    });
  } catch (err) {
    if (SHOW_ERROR_DETAILS) {
      const reason = err instanceof Error ? err.message : String(err);
      const url = joinUrl(API_BASE_URL, path);
      try { console.error('API connection error', url, reason); } catch {}
      throw new Error(`${defaultTextByStatus(0)}\n[dev] ${url}\n${reason}`);
    }
    throw new Error(defaultTextByStatus(0));
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  let data: any = null;
  if (res.status !== 204 && res.status !== 205) {
    data = isJson ? await res.json() : await res.text();
  }

  if (!res.ok) {
    if (SHOW_ERROR_DETAILS) {
      try { console.error('API error', res.status, data); } catch {}
    }
    const message = extractErrorMessage(res.status, data);
    if (res.status === 401) {
      try { unauthorizedHandler?.(); } catch {}
    }
    throw new Error(message);
  }

  return data as T;
}
export async function apiFetchRaw<T>(path: string, options: Options = {}): Promise<{ data: T; response: Response }> {
  const { token, headers, ...rest } = options;
  let authToken: string | undefined = token ?? undefined;
  if (!authToken) {
    try {
      const t = await getToken();
      authToken = t ?? undefined;
    } catch {}
  }
  let res: Response;
  try {
    const isFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData;
    res = await fetch(joinUrl(API_BASE_URL, path), {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Accept-Language': 'pt-BR,pt;q=0.9',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(headers || {}),
      },
      ...rest,
    });
  } catch (err) {
    if (SHOW_ERROR_DETAILS) {
      const reason = err instanceof Error ? err.message : String(err);
      const url = joinUrl(API_BASE_URL, path);
      try { console.error('API connection error', url, reason); } catch {}
      throw new Error(`${defaultTextByStatus(0)}\n[dev] ${url}\n${reason}`);
    }
    throw new Error(defaultTextByStatus(0));
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  let data: any = null;
  if (res.status !== 204 && res.status !== 205) {
    data = isJson ? await res.json() : await res.text();
  }

  if (!res.ok) {
    if (SHOW_ERROR_DETAILS) {
      try { console.error('API error', res.status, data); } catch {}
    }
    const message = extractErrorMessage(res.status, data);
    if (res.status === 401) {
      try { unauthorizedHandler?.(); } catch {}
    }
    throw new Error(message);
  }

  return { data: data as T, response: res };
}

let unauthorizedHandler: (() => void) | null = null;
export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler;
}
