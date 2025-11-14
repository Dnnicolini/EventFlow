import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, RefreshControl, Pressable, Alert } from 'react-native';
import tw from '@/lib/tw';
import Header from '@/components/ui/header';
import SearchInput from '@/components/ui/search-input';
import { CategoryDto, deleteCategory, listCategories } from '@/services/categories';
import { router } from 'expo-router';

export default function CategoriesIndex() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res: any = await listCategories();
      const data: CategoryDto[] = (res?.data || res || []) as CategoryDto[];
      const filtered = q
        ? data.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
        : data;
      setItems(filtered);
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Falha ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    Alert.alert('Excluir Categoria', 'Tem certeza que deseja excluir esta categoria?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(id);
            load();
          } catch (e: any) {
            Alert.alert('Erro', e?.message || 'Falha ao excluir categoria');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header />
      <View style={tw`px-4`}>
        <Text style={tw`text-gray-900 text-lg font-semibold mb-2`}>Categorias</Text>
        <SearchInput placeholder="Pesquise categorias" value={q} onChangeText={setQ} />
        <Pressable
          style={tw`mt-3 mb-2 bg-violet-700 h-10 rounded-full items-center justify-center`}
          onPress={() => router.push('/categories/create')}
        >
          <Text style={tw`text-white font-semibold`}>Criar Categoria +</Text>
        </Pressable>
      </View>
      <FlatList
        contentContainerStyle={tw`px-4 pb-8`}
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <View style={tw`bg-white rounded-xl p-3 mb-3 shadow-sm flex-row items-center justify-between`}>
            <View>
              <Text style={tw`text-gray-900 font-semibold`}>{item.name}</Text>
              {item.slug ? <Text style={tw`text-gray-500 text-xs`}>{item.slug}</Text> : null}
            </View>
            <View style={tw`flex-row gap-2`}>
              <Pressable
                onPress={() => router.push(`/categories/create?id=${item.id}`)}
                style={tw`px-3 py-1 rounded-full bg-yellow-400`}
              >
                <Text style={tw`text-xs text-white`}>Editar</Text>
              </Pressable>
              <Pressable
                onPress={() => handleDelete(item.id)}
                style={tw`px-3 py-1 rounded-full bg-red-500`}
              >
                <Text style={tw`text-xs text-white`}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load().finally(() => setRefreshing(false));
            }}
          />
        }
        ListEmptyComponent={!loading ? (
          <View style={tw`py-10 items-center`}>
            <Text style={tw`text-gray-500`}>Nenhuma categoria cadastrada</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

