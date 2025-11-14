import { apiFetch } from '@/lib/api';

export type LocationDto = {
  id: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export async function listLocations(params?: { per_page?: number }) {
  const qs = new URLSearchParams();
  if (typeof params?.per_page === 'number') qs.set('per_page', String(params.per_page));
  const query = qs.toString();
  return apiFetch<LocationDto[] | { data: LocationDto[] }>(`/locations${query ? `?${query}` : ''}`, { method: 'GET' });
}

export async function getLocation(id: number) {
  const res = await apiFetch<LocationDto | { data: LocationDto }>(`/locations/${id}`, { method: 'GET' });
  return (res as any)?.data ?? res;
}

export async function createLocation(payload: Partial<LocationDto>) {
  const res = await apiFetch<LocationDto | { data: LocationDto }>('/locations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return (res as any)?.data ?? res;
}

export async function updateLocation(id: number, payload: Partial<LocationDto>) {
  const res = await apiFetch<LocationDto | { data: LocationDto }>(`/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return (res as any)?.data ?? res;
}

export async function deleteLocation(id: number) {
  await apiFetch<unknown>(`/locations/${id}`, { method: 'DELETE' });
}
