import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Alert, ScrollView } from 'react-native';
import tw from '@/lib/tw';
import Header from '@/components/ui/header';
import InputField from '@/components/ui/input-field';
import PrimaryButton from '@/components/ui/primary-button';
import { createCategory, getCategory, updateCategory } from '@/services/categories';
import { useLocalSearchParams, router } from 'expo-router';

export default function CategoryCreate() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editingId = id ? Number(id) : undefined;
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      try {
        const cat = await getCategory(editingId);
        setName(cat.name);
      } catch (e: any) {
        Alert.alert('Erro', e?.message || 'Falha ao carregar categoria');
      }
    })();
  }, [editingId]);

  async function onSubmit() {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Informe o nome da categoria.');
      return;
    }
    try {
      setLoading(true);
      if (editingId) {
        await updateCategory(editingId, { name });
        Alert.alert('Sucesso', 'Categoria atualizada com sucesso.');
      } else {
        const created = await createCategory({ name });
        Alert.alert('Sucesso', 'Categoria criada com sucesso.', [
          {
            text: 'Ver categoria',
            onPress: () => router.replace(`/categories/create?id=${created.id}`),
          },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Falha ao salvar categoria');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <Header title={editingId ? 'Editar Categoria' : 'Cadastrar Categoria'} />
      <ScrollView contentContainerStyle={tw`px-4 pb-10`} keyboardShouldPersistTaps="handled">
        <Text style={tw`text-gray-900 text-lg font-semibold mb-3`}>
          {editingId ? 'Editar Categoria' : 'Nova Categoria'}
        </Text>
        <InputField placeholder="Nome da categoria" value={name} onChangeText={setName} />
        <View style={tw`h-4`} />
        <PrimaryButton title="Salvar" onPress={onSubmit} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

