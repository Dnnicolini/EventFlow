import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, RefreshControl, Pressable, Image } from 'react-native';
import tw from '@/lib/tw';
import Header from '@/components/ui/header';
import SearchInput from '@/components/ui/search-input';
import DateTimeField from '@/components/ui/date-time-field';
import EventCard, { EventItem } from '@/components/event/event-card';
import { listEvents } from '@/services/events';
import { resolveAssetUrl } from '@/lib/api';
import { router } from 'expo-router';

export default function EventsIndex() {
  const [q, setQ] = useState('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const res: any = await listEvents({ q, from_date: dateFrom || undefined, to_date: dateTo || undefined, per_page: 10 } as any);
      const data = Array.isArray(res) ? res : res?.data || [];
      const mapped: EventItem[] = data.map((e: any) => {
        const rawImages = Array.isArray(e.images) ? e.images : [];
        const allImages = e.image && !rawImages.includes(e.image)
          ? [e.image, ...rawImages]
          : rawImages.length
            ? rawImages
            : e.image
              ? [e.image]
              : [];
        const images = allImages
          .map((img: string) => resolveAssetUrl(img))
          .filter(Boolean) as string[];

        return {
          id: e.id,
          title: e.name || e.title || 'Evento',
          date: e.start_date || e.date,
          timeRange:
            (e.start_time && e.end_time && `${e.start_time} — ${e.end_time}`) ||
            e.time_range ||
            e.start_time ||
            undefined,
          category: e.category?.name || e.category_name,
          price: e.price,
          images,
          coverUrl:
            images[0] ||
            resolveAssetUrl(
              e.image_path ||
              e.cover_url
            ),
        } as EventItem;
      });
      setItems(mapped);
    } finally {
      setLoading(false);
    }
  }, [q, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = useCallback(({ item }: { item: EventItem }) => (
    <EventCard item={item} onPress={(id) => router.push(`/events/${id}`)} />
  ), []);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header />
      <View style={tw`px-4`}>
        <Text style={tw`text-center text-gray-700 mb-3`}>Bem vindo ao Aplicativo</Text>
        <SearchInput placeholder="Pesquise Eventos, Show e etc.." value={q} onChangeText={setQ} />
        <View style={tw`mt-3 flex-row gap-3`}>
          <View style={tw`flex-1`}>
            <DateTimeField mode="date" value={dateFrom} onChange={(v) => setDateFrom(v)} placeholder="Data inicial" />
          </View>
          <View style={tw`flex-1`}>
            <DateTimeField mode="date" value={dateTo} onChange={(v) => setDateTo(v)} placeholder="Data final" />
          </View>
        </View>
        <Text style={tw`text-center text-gray-600 mt-3`}>Explore os Eventos</Text>
        <View style={tw`mt-2 mb-2`}> 
          <Pressable onPress={() => router.push('/map')} style={tw`rounded-xl overflow-hidden`}>
            <Image source={require('@/assets/images/icon.png')} style={{ width: '100%', height: 120 }} />
            <View style={tw`absolute left-1/2 -ml-20 bottom-3 bg-white/90 rounded-full px-4 py-1 items-center justify-center`}> 
              <Text style={tw`text-gray-700`}>Explore pelo Mapa</Text>
            </View>
          </Pressable>
        </View>
        <Pressable style={tw`mb-2 bg-violet-700 h-10 rounded-full items-center justify-center`} onPress={load}>
          <Text style={tw`text-white font-semibold`}>Explorar os Eventos</Text>
        </Pressable>
      </View>
      <FlatList
        contentContainerStyle={tw`px-4 pb-8`}
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        initialNumToRender={4}
        windowSize={7}
        maxToRenderPerBatch={8}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load().finally(() => setRefreshing(false)); }} />}
        ListEmptyComponent={!loading ? (
          <View style={tw`py-16 items-center`}>
            <Text style={tw`text-gray-700`}>Nenhum evento</Text>
            <Text style={tw`text-gray-700`}>Localizado</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}
