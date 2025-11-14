import React from 'react';
import { View, Text } from 'react-native';
import tw from '@/lib/tw';

export type MapMarker = { id: string | number; latitude: number; longitude: number; title?: string; description?: string };

export default function EventMapWeb({ height = 150 }: { height?: number }) {
  return (
    <View style={[tw`rounded-xl overflow-hidden bg-gray-200 items-center justify-center`, { height }]}>
      <Text style={tw`text-gray-600`}>Mapa disponível apenas no app</Text>
    </View>
  );
}

