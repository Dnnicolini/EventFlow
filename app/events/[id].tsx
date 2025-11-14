import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import tw from '@/lib/tw';
import Header from '@/components/ui/header';
import { router } from 'expo-router';
import { getEvent } from '@/services/events';
import { resolveAssetUrl } from '@/lib/api';
import { CalendarDays, Clock } from 'lucide-react-native';
import EventMap from '@/components/map/event-map';

function formatDateDisplay(value?: string | null) {
  if (!value) return '-';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (m) {
    const [, y, mo, d] = m;
    return `${d}/${mo}/${y}`;
  }
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString();
  }
  return value;
}

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    (async () => {
      try {
        const e = await getEvent(Number(id));
        setData(e);
      } catch (e) {}
    })();
  }, [id]);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header />
      <ScrollView contentContainerStyle={tw`px-4 pb-10`}>
        {(() => {
          const rawImages = Array.isArray(data?.images) ? data.images : [];
          const allImages = data?.image && !rawImages.includes(data.image)
            ? [data.image, ...rawImages]
            : rawImages.length
              ? rawImages
              : data?.image
                ? [data.image]
                : [];
          if (!allImages.length) {
            return <View style={tw`w-full h-40 bg-gray-300 rounded-xl`} />;
          }
          return (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -16 }}
                onScroll={(e) => {
                  const idx = Math.round(
                    e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width,
                  );
                  if (!Number.isNaN(idx)) setActiveIndex(idx);
                }}
                scrollEventThrottle={16}
              >
                {allImages.map((img: string, idx: number) => {
                  const url = resolveAssetUrl(img);
                  if (!url) return null;
                  return (
                    <Image
                      key={idx}
                      source={{ uri: url }}
                      style={{ width: screenWidth, height: 220 }}
                      contentFit="cover"
                      cachePolicy="disk"
                    />
                  );
                })}
              </ScrollView>
              {allImages.length > 1 && (
                <View style={tw`flex-row justify-center mt-2`}>
                  {allImages.map((_, idx) => (
                    <View
                      key={idx}
                      style={tw.style(
                        'w-2 h-2 rounded-full mx-1',
                        idx === activeIndex ? 'bg-violet-700' : 'bg-gray-300',
                      )}
                    />
                  ))}
                </View>
              )}
            </>
          );
        })()}

        {Array.isArray(data?.images) && data.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={tw`mt-2`}
            contentContainerStyle={tw`gap-2`}
          >
            {data.images.map((img: string, idx: number) => {
              const url = resolveAssetUrl(img);
              if (!url) return null;
              return (
                <Image
                  key={idx}
                  source={{ uri: url }}
                  style={{ width: 80, height: 80, borderRadius: 8 }}
                  contentFit="cover"
                  cachePolicy="disk"
                />
              );
            })}
          </ScrollView>
        )}
        <Text style={tw`text-gray-900 text-lg font-semibold mt-3`}>{data?.name || data?.title || 'Evento'}</Text>
        <Text style={tw`text-gray-600 mt-1`}>{data?.description || 'Sem descrição.'}</Text>

        <View style={tw`mt-3 border-t border-gray-200 pt-3`}> 
          <Text style={tw`text-gray-500 text-xs mb-2`}>Informações do Evento</Text>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center`}>
              <CalendarDays size={18} color={tw.color('gray-700') || '#374151'} />
              <Text style={tw`text-gray-700 text-sm ml-2`}>
                {data?.start_date
                  ? data?.end_date && data.end_date !== data.start_date
                    ? `${formatDateDisplay(data.start_date)} — ${formatDateDisplay(data.end_date)}`
                    : formatDateDisplay(data.start_date)
                  : '-'}
              </Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Clock size={18} color={tw.color('gray-700') || '#374151'} />
              <Text style={tw`text-gray-700 text-sm ml-2`}>
                {data?.start_time && data?.end_time ? `${data.start_time} — ${data.end_time}` : data?.start_time || '-'}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`mt-4`}>
          <Text style={tw`text-violet-700 font-semibold`}>Localização</Text>
          {data?.location && data.location.latitude && data.location.longitude ? (
            <View style={tw`mt-2`}>
              <EventMap markers={[{ id: data.id, latitude: Number(data.location.latitude), longitude: Number(data.location.longitude), title: data.name || data.title }]} />
              <View style={tw`mt-2`}>
                <Text style={tw`text-gray-800`}>{data.location.address}</Text>
                {data.location.city ? <Text style={tw`text-gray-600 text-sm`}>{data.location.city}</Text> : null}
              </View>
            </View>
          ) : (
            <View style={tw`mt-2 rounded-xl overflow-hidden`}>
              <View style={tw`h-36 bg-gray-200 items-center justify-center`}>
                <Text style={tw`text-gray-600`}>Localização indisponível</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
