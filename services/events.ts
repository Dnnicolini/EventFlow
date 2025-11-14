import { apiFetch } from '@/lib/api';

export type EventDto = {
  id: number;
  user_id?: number;
  name: string;
  description?: string;
  start_date?: string;
  start_time?: string;
  end_date?: string | null;
  end_time?: string | null;
  price?: number;
  image?: string | null;
  images?: string[];
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  location?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    address?: string | null;
  } | null;
};

export type EventListParams = {
  q?: string;
  from_date?: string;
  to_date?: string;
  time_from?: string;
  time_to?: string;
  category_id?: number;
  location?: number;
  per_page?: number;
};

export async function listEvents(params?: EventListParams) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.from_date) qs.set('from_date', params.from_date);
  if (params?.to_date) qs.set('to_date', params.to_date);
  if (params?.time_from) qs.set('time_from', params.time_from);
  if (params?.time_to) qs.set('time_to', params.time_to);
  if (params?.category_id) qs.set('category_id', String(params.category_id));
  if (params?.location) qs.set('location', String(params.location));
  if (typeof params?.per_page === 'number') qs.set('per_page', String(params.per_page));
  const query = qs.toString();
  return apiFetch<{ data?: EventDto[] } | EventDto[]>(`/events${query ? `?${query}` : ''}`, { method: 'GET' });
}

export async function listMyEvents(params?: EventListParams) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.from_date) qs.set('from_date', params.from_date);
  if (params?.to_date) qs.set('to_date', params.to_date);
  if (params?.time_from) qs.set('time_from', params.time_from);
  if (params?.time_to) qs.set('time_to', params.time_to);
  if (params?.category_id) qs.set('category_id', String(params.category_id));
  if (params?.location) qs.set('location', String(params.location));
  if (typeof params?.per_page === 'number') qs.set('per_page', String(params.per_page));
  const query = qs.toString();
  return apiFetch<{ data?: EventDto[] } | EventDto[]>(`/events/mine${query ? `?${query}` : ''}`, { method: 'GET' });
}

export async function getEvent(id: number) {
  const res = await apiFetch<EventDto | { data: EventDto }>(`/events/${id}`, { method: 'GET' });
  return (res as any)?.data ?? res;
}

export async function createEvent(payload: Partial<EventDto> & {
  images?: { uri: string; name?: string; type?: string }[];
  location_id?: number;
  latitude?: number;
  longitude?: number;
}) {
  const form = new FormData();
  if (payload.name) form.append('name', payload.name);
  if (payload.description) form.append('description', payload.description);
  if (payload.category_id != null) form.append('category_id', String(payload.category_id));
  if (payload.start_date) form.append('start_date', payload.start_date);
  if (payload.end_date) form.append('end_date', payload.end_date);
  if (payload.start_time) form.append('start_time', payload.start_time);
  if (payload.end_time) form.append('end_time', payload.end_time);
  if (payload.price != null) form.append('price', String(payload.price));
  if (payload.location_id != null) form.append('location_id', String(payload.location_id));
  if (payload.latitude != null) form.append('latitude', String(payload.latitude));
  if (payload.longitude != null) form.append('longitude', String(payload.longitude));
  (payload.images || []).forEach((img, idx) => {
    const name = img.name || `image_${idx}.jpg`;
    const type = img.type || 'image/jpeg';
    form.append('images[]', { uri: img.uri, name, type } as any);
  });
  const res = await apiFetch<EventDto | { data: EventDto }>('/events', {
    method: 'POST',
    body: form,
    headers: {} as any,
  });
  return (res as any)?.data ?? res;
}

export async function updateEvent(id: number, payload: Partial<EventDto> & {
  images?: { uri: string; name?: string; type?: string }[];
  location_id?: number;
  latitude?: number;
  longitude?: number;
}) {
  const form = new FormData();
  if (payload.name) form.append('name', payload.name);
  if (payload.description) form.append('description', payload.description);
  if (payload.category_id != null) form.append('category_id', String(payload.category_id));
  if (payload.start_date) form.append('start_date', payload.start_date);
  if (payload.end_date) form.append('end_date', payload.end_date);
  if (payload.start_time) form.append('start_time', payload.start_time);
  if (payload.end_time) form.append('end_time', payload.end_time);
  if (payload.price != null) form.append('price', String(payload.price));
  if (payload.location_id != null) form.append('location_id', String(payload.location_id));
  if (payload.latitude != null) form.append('latitude', String(payload.latitude));
  if (payload.longitude != null) form.append('longitude', String(payload.longitude));
  (payload.images || []).forEach((img, idx) => {
    const name = img.name || `image_${idx}.jpg`;
    const type = img.type || 'image/jpeg';
    form.append('images[]', { uri: img.uri, name, type } as any);
  });
  form.append('_method', 'PUT');
  const res = await apiFetch<EventDto | { data: EventDto }>(`/events/${id}`, {
    method: 'POST',
    body: form,
    headers: {} as any,
  });
  return (res as any)?.data ?? res;
}

export async function deleteEvent(id: number) {
  await apiFetch<unknown>(`/events/${id}`, { method: 'DELETE' });
}
