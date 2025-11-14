import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import tw from '@/lib/tw';
import { CalendarDays, Clock, ChevronRight } from 'lucide-react-native';

export type EventItem = {
  id: number;
  title: string;
  category?: string;
  price?: number;
  date?: string;
  timeRange?: string;
  coverUrl?: string;
  images?: string[];
};

type Props = {
  item: EventItem;
  onPress?: (id: number) => void;
  ctaLabel?: string;
};

function Card({ item, onPress, ctaLabel = 'Mais Detalhes' }: Props) {
  return (
    <View style={tw`bg-white rounded-xl overflow-hidden mb-3 shadow-sm`}>
      {item.coverUrl ? (
        <Image
          source={{ uri: item.coverUrl }}
          style={{ width: '100%', height: 140 }}
          contentFit="cover"
          transition={150}
          cachePolicy="disk"
        />
      ) : (
        <View style={tw`w-full h-36 bg-gray-300`} />
      )}
      <View style={tw`p-3`}>
        <View style={tw`flex-row items-center justify-between`}>
          <Text style={tw`text-gray-900 font-semibold`} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={tw`text-gray-500 text-xs`}>
            {item.date ? new Date(item.date).toLocaleDateString() : 'DD/MM/AAAA'}
          </Text>
        </View>
        <Text style={tw`text-gray-600 text-xs mt-0.5`}>{item.category || 'Categoria'}</Text>

        <View style={tw`mt-3 border-t border-gray-200 pt-2`}> 
          <Text style={tw`text-gray-500 text-xs mb-1`}>Informações do Evento</Text>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center`}>
              <CalendarDays size={16} color={tw.color('gray-700') || '#374151'} />
              <Text style={tw`text-gray-700 text-xs ml-2`}>
                {item.date ? new Date(item.date).toLocaleDateString() : 'Data'}
              </Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Clock size={16} color={tw.color('gray-700') || '#374151'} />
              <Text style={tw`text-gray-700 text-xs ml-2`}>{item.timeRange || 'Horário'}</Text>
            </View>
          </View>
        </View>

        <View style={tw`mt-3 flex-row items-center justify-between`}>
          <Text style={tw`text-xs text-gray-600`}>Ingresso</Text>
          <Pressable
            onPress={() => onPress?.(item.id)}
            style={tw`bg-violet-700 rounded-full px-4 py-2 flex-row items-center`}
          >
            <Text style={tw`text-white text-xs mr-2`}>{ctaLabel}</Text>
            <ChevronRight size={16} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const EventCard = React.memo(Card, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.title === next.item.title &&
    prev.item.coverUrl === next.item.coverUrl &&
    prev.item.date === next.item.date &&
    prev.item.timeRange === next.item.timeRange &&
    prev.item.category === next.item.category &&
    prev.ctaLabel === next.ctaLabel &&
    prev.onPress === next.onPress
  );
});

export default EventCard;
