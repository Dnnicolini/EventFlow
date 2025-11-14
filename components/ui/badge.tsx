import React from 'react';
import { Text, View } from 'react-native';
import tw from '@/lib/tw';

export default function Badge({ text, color = 'yellow-500' }: { text: string; color?: string }) {
  return (
    <View style={tw.style('px-2 py-0.5 rounded-full', `bg-${color}`)}>
      <Text style={tw`text-xs text-white`}>{text}</Text>
    </View>
  );
}

