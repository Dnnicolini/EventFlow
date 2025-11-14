import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from '@/lib/tw';
import EventMap from '@/components/map/event-map';

export type LocationItem = {
  id: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

type Props = {
  item: LocationItem;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

function Card({ item, onView, onEdit, onDelete }: Props) {
  const hasCoords = item.latitude != null && item.longitude != null;
  return (
    <View style={tw`bg-white rounded-xl overflow-hidden mb-3 shadow-sm`}>
      <View>
        {hasCoords ? (
          <EventMap
            markers={[{ id: item.id, latitude: item.latitude as number, longitude: item.longitude as number, title: item.name }]}
            height={120}
          />
        ) : (
          <View style={tw`w-full h-30 bg-gray-200`} />
        )}
        <View style={tw`absolute top-2 right-2`}>
          <Pressable
            onPress={() => onDelete?.(item.id)}
            style={tw`px-3 py-1 rounded-full bg-red-500`}
          >
            <Text style={tw`text-white text-xs font-semibold`}>Excluir Local</Text>
          </Pressable>
        </View>
      </View>
      <View style={tw`p-3`}>
        <Text style={tw`text-gray-900 font-semibold mb-1`} numberOfLines={1}>
          {item.name}
        </Text>
        {item.address ? (
          <Text style={tw`text-gray-600 text-xs mb-3`} numberOfLines={1}>
            {item.address}
          </Text>
        ) : null}
        <View style={tw`flex-row justify-between`}>
          <Pressable
            onPress={() => onEdit?.(item.id)}
            style={tw`px-4 py-1 rounded-full bg-yellow-400`}
          >
            <Text style={tw`text-xs text-white font-semibold`}>Editar</Text>
          </Pressable>
          <Pressable
            onPress={() => onView?.(item.id)}
            style={tw`px-4 py-1 rounded-full bg-violet-700`}
          >
            <Text style={tw`text-xs text-white font-semibold`}>Ver</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const LocationCard = React.memo(Card, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.name === next.item.name &&
    prev.item.address === next.item.address &&
    prev.item.latitude === next.item.latitude &&
    prev.item.longitude === next.item.longitude &&
    prev.onView === next.onView &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete
  );
});

export default LocationCard;
