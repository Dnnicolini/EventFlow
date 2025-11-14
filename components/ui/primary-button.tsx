import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import tw from '@/lib/tw';

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function PrimaryButton({ title, onPress, loading, disabled, className }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={tw.style(`h-12 w-full items-center justify-center rounded-full bg-violet-700`, isDisabled && `opacity-60`)}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={tw`text-white font-semibold`}>{title}</Text>}
    </Pressable>
  );
}
