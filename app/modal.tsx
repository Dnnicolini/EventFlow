import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import tw from '@/lib/tw';
import { router } from 'expo-router';
import { getCurrentUser } from '@/services/auth';
import { clearToken } from '@/lib/auth-storage';

type UserInfo = { name: string; email: string };

export default function ModalScreen() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        setUser(u as UserInfo);
      } catch {
        setUser(null);
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

  const goTo = (path: string) => {
    router.replace(path);
  };

  const handleLogout = async () => {
    await clearToken();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`px-4 py-3 border-b border-gray-200 flex-row items-center justify-between`}>
        <Text style={tw`text-lg font-semibold text-gray-900`}>Menu</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={tw`text-violet-700`}>Fechar</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={tw`px-4 pb-8`}>
        <View style={tw`items-center mt-4 mb-6`}>
          <View style={tw`w-16 h-16 rounded-full bg-violet-700 items-center justify-center`}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={tw`text-white text-xl font-semibold`}>
                {initials || user?.name?.[0]?.toUpperCase() || '?'}
              </Text>
            )}
          </View>
          <Text style={tw`text-gray-900 text-base font-semibold mt-3`}>
            {user?.name || 'Usuário'}
          </Text>
          {user?.email ? <Text style={tw`text-gray-600 text-xs mt-1`}>{user.email}</Text> : null}
        </View>

        <View style={tw`border-t border-gray-200 pt-4`}>
          <MenuItem label="Início" onPress={() => goTo('/')} />
          <MenuItem label="Listar eventos" onPress={() => goTo('/events')} />
          <MenuItem label="Meus eventos" onPress={() => goTo('/events/mine')} />
          <MenuItem label="Criar evento" onPress={() => goTo('/events/create')} />
          <MenuItem label="Locais" onPress={() => goTo('/locations')} />
          <MenuItem label="Categorias" onPress={() => goTo('/categories')} />
          <MenuItem label="Meu perfil" onPress={() => goTo('/profile')} />
        </View>

        <View style={tw`mt-6 border-t border-gray-200 pt-4`}>
          <Pressable
            onPress={handleLogout}
            style={tw`h-10 rounded-full bg-red-500 items-center justify-center`}
          >
            <Text style={tw`text-white font-semibold text-sm`}>Sair</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type MenuItemProps = {
  label: string;
  onPress: () => void;
};

function MenuItem({ label, onPress }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={tw`h-10 mb-2 rounded-full bg-gray-100 px-4 flex-row items-center justify-between`}
    >
      <Text style={tw`text-gray-800 text-sm`}>{label}</Text>
      <Text style={tw`text-gray-400 text-xs`}>{'>'}</Text>
    </Pressable>
  );
}
