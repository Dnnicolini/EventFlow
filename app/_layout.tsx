import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import React, { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getToken, clearToken } from '@/lib/auth-storage';
import { onUnauthorized } from '@/lib/api';
import { getCurrentUser } from '@/services/auth';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (!stored) {
        setToken(null);
        setReady(true);
        return;
      }
      try {
        await getCurrentUser();
        setToken(stored);
      } catch {
        await clearToken();
        setToken(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      const t = await getToken();
      setToken(t);
      const inAuth = segments[0] === '(auth)';
      if (!t && !inAuth) router.replace('/(auth)/login');
      if (t && inAuth) router.replace('/');
    })();
  }, [segments, ready]);

  useEffect(() => {
    onUnauthorized(async () => {
      await clearToken();
      setToken(null);
      router.replace('/(auth)/login');
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
