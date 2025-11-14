import React from 'react';
import { View, Text } from 'react-native';
import tw from '@/lib/tw';

export default function LocationPickerWeb({ height = 160 }: { height?: number }) {
  return (
    <View style={[tw`rounded-xl overflow-hidden bg-gray-200 items-center justify-center`, { height }]}>
      <Text style={tw`text-gray-600`}>Seleção de mapa disponível apenas no app</Text>
    </View>
  );
}

