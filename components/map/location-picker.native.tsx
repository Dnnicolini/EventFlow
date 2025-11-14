import React, { useEffect, useMemo, useRef, useState } from 'react';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import { View, Text } from 'react-native';
import tw from '@/lib/tw';

type Props = {
  latitude?: number;
  longitude?: number;
  onChange?: (lat: number, lng: number) => void;
  height?: number;
};

export default function LocationPicker({ latitude, longitude, onChange, height = 160 }: Props) {
  const [coord, setCoord] = useState<{ lat: number; lng: number } | null>(
    latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null
  );
  const mapRef = useRef<MapView | null>(null);

  const region = useMemo<Region>(() => {
    if (coord) return { latitude: coord.lat, longitude: coord.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    return { latitude: -23.55052, longitude: -46.633308, latitudeDelta: 5, longitudeDelta: 5 };
  }, [coord]);

  const handlePress = (e: MapPressEvent) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setCoord({ lat, lng });
    onChange?.(lat, lng);
  };

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    const next = { lat: latitude, lng: longitude };
    setCoord(next);
    const nextRegion: Region = {
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    if (mapRef.current) {
      mapRef.current.animateToRegion(nextRegion, 500);
    }
  }, [latitude, longitude]);

  return (
    <View style={[tw`rounded-xl overflow-hidden`, { height }] }>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={region}
        onPress={handlePress}
      >
        {coord && <Marker coordinate={{ latitude: coord.lat, longitude: coord.lng }} />}
      </MapView>
      {!coord && (
        <View style={tw`absolute inset-0 items-center justify-center`}>
          <Text style={tw`bg-white/90 px-4 py-1 rounded-full text-gray-700`}>Marque no Mapa</Text>
        </View>
      )}
    </View>
  );
}
