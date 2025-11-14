import React, { useMemo } from 'react';
import MapView, { Marker, MapViewProps, Region } from 'react-native-maps';
import { View } from 'react-native';
import tw from '@/lib/tw';

export type MapMarker = { id: string | number; latitude: number; longitude: number; title?: string; description?: string };

type Props = {
  markers: MapMarker[];
  initialRegion?: Region;
  height?: number;
  mapProps?: MapViewProps;
};

export default function EventMap({ markers, initialRegion, height = 150, mapProps }: Props) {
  const region = useMemo<Region>(() => {
    if (initialRegion) return initialRegion;
    if (markers.length) {
      const m = markers[0];
      return { latitude: m.latitude, longitude: m.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    }
    return { latitude: -23.55052, longitude: -46.633308, latitudeDelta: 10, longitudeDelta: 10 };
  }, [initialRegion, markers]);

  return (
    <View style={[tw`rounded-xl overflow-hidden`, { height }]}>
      <MapView style={{ flex: 1 }} initialRegion={region} {...mapProps}>
        {markers.map((m) => (
          <Marker key={m.id} coordinate={{ latitude: m.latitude, longitude: m.longitude }} title={m.title} description={m.description} />
        ))}
      </MapView>
    </View>
  );
}
