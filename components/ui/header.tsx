import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from '@/lib/tw';
import Logo from './logo';
import { Menu } from 'lucide-react-native';
import { router } from 'expo-router';

type Props = {
  title?: string;
  onMenuPress?: () => void;
};

export default function Header({ title, onMenuPress }: Props) {
  return (
    <View style={tw`flex-row items-center justify-between px-4 py-3`}>
      <Logo width={80} height={32} />
      {title ? <Text style={tw`text-gray-800 font-semibold`}>{title}</Text> : <View />}
      <Pressable onPress={() => (onMenuPress ? onMenuPress() : router.push('/modal'))} hitSlop={10}>
        <Menu size={22} color={tw.color('gray-700') || '#374151'} />
      </Pressable>
    </View>
  );
}
