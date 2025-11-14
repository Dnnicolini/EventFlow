import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, FlatList, RefreshControl } from 'react-native';
import tw from '@/lib/tw';
import Header from '@/components/ui/header';
import { router } from 'expo-router';
import EventCard, { EventItem } from '@/components/event/event-card';
import { listEvents } from '@/services/events';
import { resolveAssetUrl } from '@/lib/api';

export default function Index() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await listEvents({ per_page: 5 } as any);
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

  const renderItem = ({ item }: { item: EventItem }) => (
    <EventCard item={item} onPress={(id) => router.push(`/events/${id}`)} />
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header />
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
        ListHeaderComponent={(
          <View style={tw`mb-4`}>
            <Text style={tw`text-center text-gray-700 text-base mb-4`}>Bem vindo ao Aplicativo</Text>

            <View style={tw`flex-row gap-3 mb-4`}>
              <View style={tw`flex-1`}>
                <Pressable
                  style={tw`h-10 rounded-full bg-violet-700 items-center justify-center`}
                  onPress={() => router.push('/events')}
                >
                  <Text style={tw`text-white font-semibold`}>Explorar Eventos</Text>
                </Pressable>
              </View>
              <View style={tw`flex-1`}>
                <Pressable
                  style={tw`h-10 rounded-full bg-violet-500 items-center justify-center`}
                  onPress={() => router.push('/events/create')}
                >
                  <Text style={tw`text-white font-semibold`}>Criar Evento</Text>
                </Pressable>
              </View>
            </View>

            <Text style={tw`text-gray-700 font-semibold mb-2`}>Próximos eventos</Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={tw`py-16 items-center`}>
              <Text style={tw`text-gray-500`}>Nenhum evento</Text>
              <Text style={tw`text-gray-500`}>Localizado</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
