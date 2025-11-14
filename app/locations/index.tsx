import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, RefreshControl, Pressable, Alert } from 'react-native';
import tw from '@/lib/tw';
import Header from '@/components/ui/header';
import SearchInput from '@/components/ui/search-input';
import LocationCard from '@/components/location/location-card';
import { deleteLocation, listLocations } from '@/services/locations';
import { listEvents } from '@/services/events';
import { router } from 'expo-router';

export default function LocationsIndex() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res: any = await listLocations();
      const data = (res?.data || res || []) as any[];
      const filtered = q
        ? data.filter((l) =>
            (l.name || '').toLowerCase().includes(q.toLowerCase()) ||
            (l.address || '').toLowerCase().includes(q.toLowerCase())
          )
        : data;
      setItems(filtered);
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Falha ao carregar locais');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    try {
      const res: any = await listEvents({ location: id, per_page: 0 } as any);
      const events = Array.isArray(res) ? res : (res?.data || []);
      const hasEvents = events.length > 0;
      const msg = hasEvents
        ? `Este local está vinculado a ${events.length} evento(s). Ao excluir o local, esses eventos também serão removidos. Deseja continuar?`
        : 'Tem certeza que deseja excluir este local?';

      Alert.alert('Excluir Local', msg, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLocation(id);
              load();
            } catch (e: any) {
              Alert.alert('Erro', e?.message || 'Falha ao excluir local');
            }
          },
        },
      ]);
    } catch (e: any) {
      Alert.alert('Excluir Local', 'Tem certeza que deseja excluir este local?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLocation(id);
              load();
            } catch (err: any) {
              Alert.alert('Erro', err?.message || 'Falha ao excluir local');
            }
          },
        },
      ]);
    }
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header />
      <View style={tw`px-4`}>
        <Text style={tw`text-gray-900 text-lg font-semibold mb-2`}>Listagem de Locais</Text>
        <SearchInput placeholder="Pesquise Locais" value={q} onChangeText={setQ} />
        <Pressable
          style={tw`mt-3 mb-2 bg-violet-700 h-10 rounded-full items-center justify-center`}
          onPress={() => router.push('/locations/create')}
        >
          <Text style={tw`text-white font-semibold`}>Criar Local +</Text>
        </Pressable>
      </View>
      <FlatList
        contentContainerStyle={tw`px-4 pb-8`}
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <LocationCard
            item={{
              id: item.id,
              name: item.name || item.title || 'Local',
              address: item.address,
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            onView={(id) => {}}
            onEdit={(id) => router.push(`/locations/create?id=${id}`)}
            onDelete={handleDelete}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load().finally(() => setRefreshing(false)); }} />}
        ListEmptyComponent={!loading ? (
          <View style={tw`py-10 items-center`}>
            <Text style={tw`text-gray-500`}>Nenhum local cadastrado</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}
