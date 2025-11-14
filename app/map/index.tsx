import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import tw from '@/lib/tw';
import Header from '@/components/ui/header';
import EventMap, { MapMarker } from '@/components/map/event-map';
import { listEvents } from '@/services/events';
import * as Location from 'expo-location';

export default function ExploreMap() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res: any = await listEvents({ per_page: 100 } as any);
        const data = Array.isArray(res) ? res : res?.data || [];
        const mm: MapMarker[] = data
          .filter((e: any) => e.location && e.location.latitude && e.location.longitude)
          .map((e: any) => ({ id: e.id, latitude: Number(e.location.latitude), longitude: Number(e.location.longitude), title: e.name || e.title }));
        setMarkers(mm);
      } catch (e: any) {
        Alert.alert('Erro', e?.message || 'Falha ao carregar eventos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getLastKnownPositionAsync();
        if (pos) setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {}
    })();
  }, []);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header title="Explorar pelo Mapa" />
      <View style={tw`p-4`}> 
        {loading ? (
          <View style={tw`h-40 items-center justify-center`}><ActivityIndicator /></View>
        ) : (
          <EventMap
            markers={markers}
            height={500}
            initialRegion={center ? { latitude: center.lat, longitude: center.lng, latitudeDelta: 0.2, longitudeDelta: 0.2 } : undefined}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

