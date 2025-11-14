import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, Alert, ScrollView } from 'react-native';
import tw from '@/lib/tw';
import Logo from '@/components/ui/logo';
import InputField from '@/components/ui/input-field';
import PrimaryButton from '@/components/ui/primary-button';
import { Mail, KeyRound } from 'lucide-react-native';
import { login as loginRequest } from '@/services/auth';
import { saveToken } from '@/lib/auth-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    try {
      setLoading(true);
      const res = await loginRequest({ email, password });
      const token = (res as any)?.token || (res as any)?.access_token || (res as any)?.data?.token;
      if (!token) {
        Alert.alert('Erro ao entrar', 'Token não recebido. Tente novamente.');
        return;
      }
      await saveToken(token);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Erro ao entrar', e?.message || 'Verifique suas credenciais');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`flex-1 px-6`} keyboardShouldPersistTaps="handled">
        <View style={tw`flex-1`}>
          <View style={tw`items-center mt-16 mb-10`}>
            <Logo />
          </View>

          <View style={tw`gap-4`}>
            <InputField
              Icon={Mail}
              placeholder="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
            <InputField
              Icon={KeyRound}
              placeholder="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
            />

            <PrimaryButton title="Entrar" onPress={onSubmit} loading={loading} />

            <View style={tw`items-center mt-2`}>
              <Text style={tw`text-gray-600`}>Não tem conta?</Text>
              <Link href="/(auth)/register" asChild>
                <Text style={tw`text-violet-700 font-semibold mt-1`}>Criar conta</Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
