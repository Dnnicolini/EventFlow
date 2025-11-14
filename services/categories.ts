import { apiFetch } from '@/lib/api';

export type CategoryDto = { id: number; name: string; slug?: string };

export async function listCategories(params?: { per_page?: number }) {
  const qs = new URLSearchParams();
  if (typeof params?.per_page === 'number') qs.set('per_page', String(params.per_page));
  const query = qs.toString();
  return apiFetch<CategoryDto[] | { data: CategoryDto[] }>(`/categories${query ? `?${query}` : ''}`, { method: 'GET' });
}

export async function getCategory(id: number) {
  const res = await apiFetch<CategoryDto | { data: CategoryDto }>(`/categories/${id}`, { method: 'GET' });
  return (res as any)?.data ?? res;
}

export async function createCategory(payload: { name: string }) {
  const res = await apiFetch<{ data: CategoryDto } | CategoryDto>('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return (res as any)?.data ?? res;
}

export async function updateCategory(id: number, payload: { name: string }) {
  const res = await apiFetch<{ data: CategoryDto } | CategoryDto>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return (res as any)?.data ?? res;
}

export async function deleteCategory(id: number) {
  await apiFetch<unknown>(`/categories/${id}`, { method: 'DELETE' });
}
