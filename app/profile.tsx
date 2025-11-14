import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, Alert, Pressable, ScrollView } from 'react-native';
import tw from '@/lib/tw';
import Header from '@/components/ui/header';
import { getCurrentUser } from '@/services/auth';
import { listMyEvents } from '@/services/events';
import { listCategories } from '@/services/categories';
import { listLocations } from '@/services/locations';
import { router } from 'expo-router';

type UserInfo = { name: string; email: string; created_at?: string };

type Stats = {
  events: number;
  locations: number;
  categories: number;
};

export default function ProfileScreen() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState<Stats>({ events: 0, locations: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [userData, eventsRes, locsRes, catsRes] = await Promise.all([
          getCurrentUser(),
          listMyEvents({ per_page: 0 } as any),
          listLocations({ per_page: 0 }),
          listCategories({ per_page: 0 }),
        ]);
        setUser(userData);
        const events = Array.isArray(eventsRes) ? eventsRes : (eventsRes as any)?.data || [];
        const locs = Array.isArray(locsRes) ? locsRes : (locsRes as any)?.data || [];
        const cats = Array.isArray(catsRes) ? catsRes : (catsRes as any)?.data || [];
        setStats({
          events: events.length,
          locations: locs.length,
          categories: cats.length,
        });
      } catch (e: any) {
        Alert.alert('Erro', e?.message || 'Falha ao carregar perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
    : '';

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header title="Meu Perfil" />
      {loading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator />
        </View>
      ) : !user ? (
        <View style={tw`flex-1 items-center justify-center px-4`}>
          <Text style={tw`text-gray-500 text-center`}>Não foi possível carregar os dados do perfil.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={tw`px-4 pb-10`}>
          <View style={tw`items-center mt-6 mb-6`}>
            <View style={tw`w-20 h-20 rounded-full bg-violet-700 items-center justify-center`}>
              <Text style={tw`text-white text-2xl font-semibold`}>{initials || user.name[0]?.toUpperCase()}</Text>
            </View>
            <Text style={tw`text-gray-900 text-lg font-semibold mt-3`}>{user.name}</Text>
            <Text style={tw`text-gray-700 mt-1`}>{user.email}</Text>
            {user.created_at ? (
              <Text style={tw`text-gray-500 text-xs mt-2`}>Conta criada em {user.created_at}</Text>
            ) : null}
          </View>

          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-800 font-semibold mb-2`}>Resumo</Text>
            <View style={tw`flex-row bg-gray-100 rounded-xl p-3 justify-between`}>
              <View style={tw`items-center flex-1`}>
                <Text style={tw`text-gray-900 text-lg font-semibold`}>{stats.events}</Text>
                <Text style={tw`text-gray-600 text-xs`}>Meus eventos</Text>
              </View>
              <View style={tw`items-center flex-1`}>
                <Text style={tw`text-gray-900 text-lg font-semibold`}>{stats.locations}</Text>
                <Text style={tw`text-gray-600 text-xs`}>Locais</Text>
              </View>
              <View style={tw`items-center flex-1`}>
                <Text style={tw`text-gray-900 text-lg font-semibold`}>{stats.categories}</Text>
                <Text style={tw`text-gray-600 text-xs`}>Categorias</Text>
              </View>
            </View>
          </View>

          <View>
            <Text style={tw`text-gray-800 font-semibold mb-2`}>Atalhos</Text>
            <View style={tw`gap-3`}>
              <Pressable
                style={tw`h-10 rounded-full bg-violet-700 items-center justify-center`}
                onPress={() => router.push('/events/mine')}
              >
                <Text style={tw`text-white font-semibold text-sm`}>Ver meus eventos</Text>
              </Pressable>
              <Pressable
                style={tw`h-10 rounded-full bg-violet-500 items-center justify-center`}
                onPress={() => router.push('/events/create')}
              >
                <Text style={tw`text-white font-semibold text-sm`}>Criar novo evento</Text>
              </Pressable>
              <Pressable
                style={tw`h-10 rounded-full bg-emerald-600 items-center justify-center`}
                onPress={() => router.push('/locations')}
              >
                <Text style={tw`text-white font-semibold text-sm`}>Gerenciar locais</Text>
              </Pressable>
              <Pressable
                style={tw`h-10 rounded-full bg-emerald-500 items-center justify-center`}
                onPress={() => router.push('/categories')}
              >
                <Text style={tw`text-white font-semibold text-sm`}>Gerenciar categorias</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
