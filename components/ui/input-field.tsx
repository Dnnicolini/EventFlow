import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import tw from '@/lib/tw';

type IconProps = {
  color?: string;
  size?: number;
};

type Props = TextInputProps & {
  Icon?: React.ComponentType<IconProps>;
};

export default function InputField({ Icon, className, ...props }: Props) {
  return (
    <View style={tw`w-full`}>
      <View style={tw`flex-row items-center h-12 rounded-full bg-gray-200 px-4`}>
        {Icon ? <Icon size={20} color={tw.color('gray-500') ?? '#6B7280'} /> : null}
        <TextInput
          placeholderTextColor={tw.color('gray-500') ?? '#6B7280'}
          style={tw`flex-1 text-gray-900 pl-3`}
          {...props}
        />
      </View>
    </View>
  );
}
