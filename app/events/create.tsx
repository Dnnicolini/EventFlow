import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Alert, Image, Pressable, ScrollView, Modal } from 'react-native';
import tw from '@/lib/tw';
import Header from '@/components/ui/header';
import InputField from '@/components/ui/input-field';
import PrimaryButton from '@/components/ui/primary-button';
import Select from '@/components/ui/select';
import { listCategories } from '@/services/categories';
import { createEvent, getEvent, updateEvent } from '@/services/events';
import { listLocations, createLocation } from '@/services/locations';
import * as ImagePicker from 'expo-image-picker';
import DateTimeField from '@/components/ui/date-time-field';
import LocationPicker from '@/components/map/location-picker';
import * as ExpoLocation from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';

export default function EventCreate() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = id ? Number(id) : undefined;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [catOptions, setCatOptions] = useState<{ label: string; value: number }[]>([]);
  const [locOptions, setLocOptions] = useState<{ label: string; value: number; latitude?: number; longitude?: number; address?: string }[]>([]);
  const [locationId, setLocationId] = useState<number | undefined>();
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocLatitude, setNewLocLatitude] = useState('');
  const [newLocLongitude, setNewLocLongitude] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cats: any = await listCategories();
        const list = (Array.isArray(cats?.data) ? cats.data : cats) || [];
        setCatOptions(list.map((c: any) => ({ label: c.name, value: c.id })));

        const locs: any = await listLocations();
        const locList = (Array.isArray(locs?.data) ? locs.data : locs) || [];
        setLocOptions(
          locList.map((l: any) => ({
            label: l.name,
            value: l.id,
            latitude: l.latitude,
            longitude: l.longitude,
            address: l.address,
          }))
        );
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const e: any = await getEvent(editingId);
        setTitle(e.name || '');
        setDescription(e.description || '');
        setCategoryId(e.category?.id);
        setDate(e.start_date || '');
        setEndDate(e.end_date || '');
        setStart(e.start_time || '');
        setEnd(e.end_time || '');
        if (typeof e.price === 'number') {
          const cents = Math.round(e.price * 100);
          handlePriceChange(String(cents));
        }
        if (e.location) {
          setLocationId(e.location.id);
          if (e.location.latitude != null) setLatitude(String(e.location.latitude));
          if (e.location.longitude != null) setLongitude(String(e.location.longitude));
        }
      } catch {}
    })();
  }, [editingId]);

  const handlePriceChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (!digits) {
      setPrice('');
      return;
    }
    const padded = digits.padStart(3, '0');
    const integerPart = padded.slice(0, -2).replace(/^0+/, '') || '0';
    const decimalPart = padded.slice(-2);
    const formatted = `${integerPart},${decimalPart}`;
    setPrice(formatted);
  };

  const handleSelectLocation = (id: number) => {
    setLocationId(id);
    const selected = locOptions.find((o) => o.value === id);
    if (selected?.latitude != null && selected?.longitude != null) {
      setLatitude(String(selected.latitude));
      setLongitude(String(selected.longitude));
    }
    setLocationModalOpen(false);
  };

  const handleModalMapChange = async (lat: number, lng: number) => {
    const latStr = String(lat);
    const lngStr = String(lng);
    setNewLocLatitude(latStr);
    setNewLocLongitude(lngStr);
    try {
      const results = await ExpoLocation.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const info = results?.[0];
      if (info) {
        const parts = [
          info.street || info.name,
          info.subregion,
          info.region,
        ].filter(Boolean);
        if (parts.length) {
          setNewLocAddress(parts.join(', '));
        }
        if (!newLocName && (info.name || info.street)) {
          setNewLocName(info.name || info.street || '');
        }
      }
    } catch {}
  };

  const handleAddressSearch = async () => {
    const query = newLocAddress.trim();
    if (!query) {
      Alert.alert('Atenção', 'Digite um endereço ou CEP para buscar.');
      return;
    }
    try {
      const results = await ExpoLocation.geocodeAsync(query);
      const pos = results[0];
      if (!pos) {
        Alert.alert('Endereço não encontrado', 'Tente ser mais específico ou verifique o CEP.');
        return;
      }
      await handleModalMapChange(pos.latitude, pos.longitude);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível localizar o endereço.');
    }
  };

  const openLocationModal = async () => {
    if (!newLocLatitude || !newLocLongitude) {
      if (latitude && longitude) {
        await handleModalMapChange(Number(latitude), Number(longitude));
      } else {
        const selected = locationId
          ? locOptions.find((o) => o.value === locationId && o.latitude != null && o.longitude != null)
          : undefined;
        if (selected && selected.latitude != null && selected.longitude != null) {
          await handleModalMapChange(selected.latitude, selected.longitude);
        } else {
          try {
            const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              const pos =
                (await ExpoLocation.getLastKnownPositionAsync()) ||
                (await ExpoLocation.getCurrentPositionAsync({}));
              if (pos) {
                await handleModalMapChange(pos.coords.latitude, pos.coords.longitude);
              }
            }
          } catch {}
        }
      }
    }
    setLocationModalOpen(true);
  };

  const handleSaveLocation = async () => {
    if (!newLocName || !newLocLatitude || !newLocLongitude) {
      Alert.alert('Atenção', 'Preencha nome e selecione a posição no mapa.');
      return;
    }
    try {
      setSavingLocation(true);
      const payload = {
        name: newLocName,
        address: newLocAddress,
        latitude: Number(newLocLatitude),
        longitude: Number(newLocLongitude),
      };
      const res: any = await createLocation(payload);
      const loc = (res as any)?.data || res;
      const option = {
        label: loc.name,
        value: loc.id,
        latitude: loc.latitude ?? payload.latitude,
        longitude: loc.longitude ?? payload.longitude,
        address: loc.address ?? payload.address,
      };
      setLocOptions((prev) => [...prev, option]);
      setLocationId(option.value);
      setLatitude(String(option.latitude));
      setLongitude(String(option.longitude));
      setLocationModalOpen(false);
      setNewLocName('');
      setNewLocAddress('');
      setNewLocLatitude('');
      setNewLocLongitude('');
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Falha ao salvar local');
    } finally {
      setSavingLocation(false);
    }
  };

  async function onSubmit() {
    try {
      if (!date || !start) {
        Alert.alert('Atenção', 'Informe a data do evento e o horário inicial.');
        return;
      }

      const parseDateOnly = (d: string) => {
        const [y, m, day] = d.split('-').map(Number);
        return new Date(y || 0, (m || 1) - 1, day || 1, 0, 0, 0, 0);
      };

      const today = new Date();
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startDateOnly = parseDateOnly(date);

      if (startDateOnly.getTime() < todayOnly.getTime()) {
        Alert.alert('Atenção', 'A data inicial não pode ser no passado.');
        return;
      }

      if (endDate) {
        const endDateOnly = parseDateOnly(endDate);
        if (endDateOnly.getTime() < startDateOnly.getTime()) {
          Alert.alert('Atenção', 'A data final deve ser depois ou igual à data inicial.');
          return;
        }
      }

      setLoading(true);
      const priceDigits = price.replace(/\D/g, '');
      const numericPrice = priceDigits ? Number(priceDigits) / 100 : undefined;
      const payload: any = {
        name: title,
        description,
        category_id: categoryId,
        start_date: date,
        end_date: endDate || undefined,
        start_time: start,
        end_time: end,
        price: numericPrice,
        location_id: locationId,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        images,
      };
      if (editingId) {
        const updated = await updateEvent(editingId, payload);
        Alert.alert('Sucesso', 'Evento atualizado com sucesso.', [
          {
            text: 'Ver evento',
            onPress: () => router.replace(`/events/${updated.id}`),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]);
      } else {
        const created = await createEvent(payload);
        Alert.alert('Sucesso', 'Evento criado com sucesso.', [
          {
            text: 'Ver evento',
            onPress: () => router.replace(`/events/${created.id}`),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Falha ao criar evento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header />
      <ScrollView contentContainerStyle={tw`px-4 pb-10`} keyboardShouldPersistTaps="handled">
        <Text style={tw`text-gray-900 text-lg font-semibold mb-3`}>Cadastrar Evento</Text>
        <View style={tw`flex-row gap-3 mb-3`}>
          {images.slice(0, 3).map((img, idx) => (
            <Pressable key={idx} onLongPress={() => setImages((prev) => prev.filter((_, i) => i !== idx))}>
              <Image source={{ uri: img.uri }} style={{ width: 72, height: 72, borderRadius: 8 }} />
            </Pressable>
          ))}
          <Pressable
            onPress={async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Autorize o acesso à galeria.');
                return;
              }
              const res = await ImagePicker.launchImageLibraryAsync({
                allowsMultipleSelection: true,
                mediaTypes: ['images'],
                quality: 0.8,
              });
              if (!(res as any).canceled) {
                const assets = (res as any).assets || [];
                setImages((prev) => [...prev, ...assets.map((a: any) => ({ uri: a.uri }))]);
              }
            }}
            style={tw`w-18 h-18 border border-dashed border-gray-300 rounded-lg items-center justify-center px-3 py-3`}
          >
            <Text style={tw`text-gray-700`}>+ Upload</Text>
          </Pressable>
        </View>

        <InputField placeholder="Nome" value={title} onChangeText={setTitle} />
        <View style={tw`h-3`} />
        <InputField placeholder="Descrição" value={description} onChangeText={setDescription} multiline />
        <View style={tw`h-3`} />
        <Select label="Categoria" options={catOptions} value={categoryId} onChange={setCategoryId} />
        <View style={tw`h-3`} />
        <DateTimeField mode="date" value={date} onChange={(v) => setDate(v)} placeholder="Data inicial do Evento" />
        <View style={tw`h-3`} />
        <DateTimeField mode="date" value={endDate} onChange={(v) => setEndDate(v)} placeholder="Data final (opcional)" />
        <View style={tw`h-3`} />
        <View style={tw`flex-row gap-3`}>
          <View style={tw`flex-1`}>
            <DateTimeField mode="time" value={start} onChange={(v) => setStart(v)} placeholder="Horário Inicial" />
          </View>
          <View style={tw`flex-1`}>
            <DateTimeField mode="time" value={end} onChange={(v) => setEnd(v)} placeholder="Horário Final" />
          </View>
        </View>
        <View style={tw`h-3`} />
        <InputField placeholder="Valor Ingresso (R$)" value={price} onChangeText={handlePriceChange} keyboardType="numeric" />
        <View style={tw`h-3`} />
        <View>
          <Text style={tw`mb-1 text-gray-700`}>Selecione os Locais Cadastrados</Text>
          <Pressable
            onPress={openLocationModal}
            style={tw`h-12 rounded-lg border border-gray-300 px-3 flex-row items-center justify-between`}
          >
            <Text style={tw`text-gray-800`}>
              {locOptions.find((o) => o.value === locationId)?.label || 'Selecionar ou cadastrar local'}
            </Text>
            <Text style={tw`text-gray-500`}>Abrir</Text>
          </Pressable>
        </View>
        <View style={tw`h-3`} />
        <LocationPicker
          latitude={latitude ? Number(latitude) : undefined}
          longitude={longitude ? Number(longitude) : undefined}
          onChange={(lat: number, lng: number) => { setLatitude(String(lat)); setLongitude(String(lng)); }}
          height={140}
        />
        <View style={tw`h-4`} />
        <PrimaryButton title="Salvar" onPress={onSubmit} loading={loading} />
      </ScrollView>
      <Modal visible={locationModalOpen} animationType="slide" onRequestClose={() => setLocationModalOpen(false)}>
        <SafeAreaView style={tw`flex-1 bg-white`}>
          <View style={tw`px-4 py-3 border-b border-gray-200 flex-row items-center justify-between`}>
            <Text style={tw`text-lg font-semibold text-gray-900`}>Selecionar Local</Text>
            <Pressable onPress={() => setLocationModalOpen(false)}>
              <Text style={tw`text-violet-700`}>Fechar</Text>
            </Pressable>
          </View>
          <View style={tw`flex-1`}>
            <ScrollView contentContainerStyle={tw`px-4 pb-6`} keyboardShouldPersistTaps="handled">
              <Text style={tw`mt-3 mb-1 text-gray-700`}>Locais cadastrados</Text>
              {locOptions.length ? (
                <View>
                  {locOptions.map((item) => (
                    <Pressable
                      key={String(item.value)}
                      onPress={() => handleSelectLocation(item.value)}
                      style={tw`py-2 border-b border-gray-100`}
                    >
                      <Text style={tw`text-gray-800`}>{item.label}</Text>
                      {item.address ? <Text style={tw`text-gray-500 text-xs`}>{item.address}</Text> : null}
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={tw`text-gray-500 text-sm`}>Nenhum local cadastrado.</Text>
              )}
              <View style={tw`mt-4 border-t border-gray-200 pt-4`}>
                <Text style={tw`mb-2 text-gray-700 font-semibold`}>Cadastrar novo local</Text>
                <InputField placeholder="Nome do local" value={newLocName} onChangeText={setNewLocName} />
                <View style={tw`h-3`} />
                <InputField placeholder="Endereço ou CEP" value={newLocAddress} onChangeText={setNewLocAddress} />
                <View style={tw`h-2`} />
                <Pressable onPress={handleAddressSearch} style={tw`self-start px-4 py-1 rounded-full bg-violet-700`}>
                  <Text style={tw`text-white text-xs font-semibold`}>Buscar no mapa</Text>
                </Pressable>
                <View style={tw`h-3`} />
                <LocationPicker
                  latitude={newLocLatitude ? Number(newLocLatitude) : undefined}
                  longitude={newLocLongitude ? Number(newLocLongitude) : undefined}
                  onChange={handleModalMapChange}
                  height={140}
                />
                <View style={tw`h-3`} />
                <View style={tw`flex-row gap-3`}>
                  <View style={tw`flex-1`}>
                    <InputField placeholder="Latitude" value={newLocLatitude} onChangeText={setNewLocLatitude} keyboardType="decimal-pad" />
                  </View>
                  <View style={tw`flex-1`}>
                    <InputField placeholder="Longitude" value={newLocLongitude} onChangeText={setNewLocLongitude} keyboardType="decimal-pad" />
                  </View>
                </View>
                <View style={tw`h-4`} />
                <PrimaryButton title="Salvar Local" onPress={handleSaveLocation} loading={savingLocation} />
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
