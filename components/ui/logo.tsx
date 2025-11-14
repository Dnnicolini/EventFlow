import tw from '@/lib/tw';
import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';

type Props = {
  source?: any;
  width?: number;
  height?: number;
};

export default function Logo({
  source = require('@/assets/images/adaptive-icon.png'),
  width = 300,
}: Props) {
  return (
    <View style={tw`items-center justify-center`}>
      <View style={tw`items-center justify-center`}>
        <Image
          source={source}
          style={{ width, height: width / 2, resizeMode: 'contain' }}
          contentFit="contain"
        />
      </View>
    </View>
  );
}
