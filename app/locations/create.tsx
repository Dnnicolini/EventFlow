import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Alert, ScrollView, Pressable } from 'react-native';
import tw from '@/lib/tw';
import Header from '@/components/ui/header';
import InputField from '@/components/ui/input-field';
import PrimaryButton from '@/components/ui/primary-button';
import { createLocation, getLocation, updateLocation } from '@/services/locations';
import { useLocalSearchParams, router } from 'expo-router';
import LocationPicker from '@/components/map/location-picker';
import * as ExpoLocation from 'expo-location';

export default function LocationCreate() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = id ? Number(id) : undefined;
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const loc = await getLocation(editingId);
        setName(loc.name || '');
        setAddress(loc.address || '');
        setZip('');
        setLatitude(loc.latitude != null ? String(loc.latitude) : '');
        setLongitude(loc.longitude != null ? String(loc.longitude) : '');
      } catch (e: any) {
        Alert.alert('Erro', e?.message || 'Falha ao carregar local');
      }
    })();
  }, [editingId]);

  async function onSubmit() {
    try {
      setLoading(true);
      const payload = {
        name,
        address,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      };
      if (editingId) {
        await updateLocation(editingId, payload);
        Alert.alert('Sucesso', 'Local atualizado com sucesso.');
      } else {
        const created = await createLocation(payload);
        Alert.alert('Sucesso', 'Local salvo com sucesso.', [
          {
            text: 'Ver local',
            onPress: () => router.replace(`/locations/create?id=${created.id}`),
          },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Falha ao salvar local');
    } finally {
      setLoading(false);
    }
  }

  const handleZipSearch = async () => {
    const query = zip.trim();
    if (!query) {
      Alert.alert('Atenção', 'Digite o CEP para buscar.');
      return;
    }
    try {
      const results = await ExpoLocation.geocodeAsync(query);
      const pos = results[0];
      if (!pos) {
        Alert.alert('CEP não encontrado', 'Tente ser mais específico ou verifique o CEP.');
        return;
      }
      setLatitude(String(pos.latitude));
      setLongitude(String(pos.longitude));
      try {
        const rev = await ExpoLocation.reverseGeocodeAsync({
          latitude: pos.latitude,
          longitude: pos.longitude,
        });
        const info = rev[0];
        if (info) {
          const parts = [
            info.street || info.name,
            info.subregion,
            info.region,
          ].filter(Boolean);
          if (parts.length) {
            setAddress(parts.join(', '));
          }
          if (!name && (info.name || info.street)) {
            setName(info.name || info.street || '');
          }
        }
      } catch {}
    } catch {
      Alert.alert('Erro', 'Não foi possível localizar o CEP.');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header />
      <ScrollView contentContainerStyle={tw`px-4 pb-10`} keyboardShouldPersistTaps="handled">
        <Text style={tw`text-gray-900 text-lg font-semibold mb-3`}>
          {editingId ? 'Editar Local' : 'Cadastrar Local'}
        </Text>
        <InputField placeholder="CEP" value={zip} onChangeText={setZip} keyboardType="numeric" />
        <View style={tw`h-2`} />
        <Pressable onPress={handleZipSearch} style={tw`self-start px-4 py-1 rounded-full bg-violet-700 mb-2`}>
          <Text style={tw`text-white text-xs font-semibold`}>Buscar endereço no mapa</Text>
        </Pressable>
        <View style={tw`h-1`} />
        <InputField placeholder="Endereço" value={address} onChangeText={setAddress} />
        <View style={tw`h-3`} />
        <InputField placeholder="Nome do local / Bairro" value={name} onChangeText={setName} />
        <View style={tw`h-3`} />
        <View style={tw`flex-row gap-3`}>
          <View style={tw`flex-1`}>
            <InputField placeholder="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="decimal-pad" />
          </View>
          <View style={tw`flex-1`}>
            <InputField placeholder="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="decimal-pad" />
          </View>
        </View>
        <View style={tw`h-3`} />
        <LocationPicker
          latitude={latitude ? Number(latitude) : undefined}
          longitude={longitude ? Number(longitude) : undefined}
          onChange={(lat, lng) => {
            setLatitude(String(lat));
            setLongitude(String(lng));
          }}
          height={180}
        />
        <View style={tw`h-4`} />
        <View style={tw`flex-row gap-3`}>
          <View style={tw`flex-1`}>
            <PrimaryButton title="Salvar" onPress={onSubmit} loading={loading} />
          </View>
          <View style={tw`flex-1`}>
            <PrimaryButton title="Cancelar" onPress={() => {}} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
