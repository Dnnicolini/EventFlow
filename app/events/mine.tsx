import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, RefreshControl, Pressable, Alert } from 'react-native';
import tw from '@/lib/tw';
import Header from '@/components/ui/header';
import EventCard, { EventItem } from '@/components/event/event-card';
import { deleteEvent, listMyEvents } from '@/services/events';
import { resolveAssetUrl } from '@/lib/api';
import { router } from 'expo-router';

export default function MyEventsScreen() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const res: any = await listMyEvents({ per_page: 20 } as any);
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: number) {
    Alert.alert('Excluir Evento', 'Tem certeza que deseja excluir este evento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(id);
            load();
          } catch (e: any) {
            Alert.alert('Erro', e?.message || 'Falha ao excluir evento');
          }
        },
      },
    ]);
  }

  const renderItem = ({ item }: { item: EventItem }) => (
    <View style={tw`mb-2`}>
      <EventCard item={item} onPress={(id) => router.push(`/events/${id}`)} />
      <View style={tw`flex-row justify-end px-1 mb-1`}>
        <Pressable
          onPress={() => router.push(`/events/create?id=${item.id}`)}
          style={tw`px-4 py-1 rounded-full bg-yellow-400 mr-2`}
        >
          <Text style={tw`text-xs text-white font-semibold`}>Editar</Text>
        </Pressable>
        <Pressable
          onPress={() => handleDelete(item.id)}
          style={tw`px-4 py-1 rounded-full bg-red-500`}
        >
          <Text style={tw`text-xs text-white font-semibold`}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header title="Meus Eventos" />
      <FlatList
        contentContainerStyle={tw`px-4 pb-8`}
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load().finally(() => setRefreshing(false));
            }}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={tw`py-16 items-center`}>
              <Text style={tw`text-gray-500`}>Você ainda não criou eventos</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
