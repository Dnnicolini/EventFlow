import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Search } from 'lucide-react-native';
import tw from '@/lib/tw';

export default function SearchInput(props: TextInputProps) {
  return (
    <View style={tw`flex-row items-center h-10 rounded-full bg-gray-200 px-3`}>
      <Search size={18} color={tw.color('gray-500') || '#6B7280'} />
      <TextInput
        placeholderTextColor={tw.color('gray-500') || '#6B7280'}
        style={tw`flex-1 text-gray-900 pl-2`}
        {...props}
      />
    </View>
  );
}

