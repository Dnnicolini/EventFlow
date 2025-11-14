import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, Alert, ScrollView } from 'react-native';
import tw from '@/lib/tw';
import Logo from '@/components/ui/logo';
import InputField from '@/components/ui/input-field';
import PrimaryButton from '@/components/ui/primary-button';
import { User, Mail, Lock } from 'lucide-react-native';
import { register as registerRequest, login as loginRequest } from '@/services/auth';
import { saveToken } from '@/lib/auth-storage';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (password !== confirm) {
      Alert.alert('As senhas não coincidem');
      return;
    }
    try {
      setLoading(true);
      const res = await registerRequest({ name, email, password, password_confirmation: confirm });
      let token = (res as any)?.token || (res as any)?.access_token || (res as any)?.data?.token;
      if (!token) {
        const loginRes = await loginRequest({ email, password });
        token = (loginRes as any)?.token || (loginRes as any)?.access_token || (loginRes as any)?.data?.token;
      }
      if (!token) {
        Alert.alert('Erro ao registrar', 'Token não recebido. Tente entrar com seu e-mail e senha.');
        return;
      }
      await saveToken(token);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Erro ao registrar', e?.message || 'Tente novamente');
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
              Icon={User}
              placeholder="Nome"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />
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
              Icon={Lock}
              placeholder="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="next"
            />
            <InputField
              Icon={Lock}
              placeholder="Confirmar senha"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              returnKeyType="done"
            />

            <PrimaryButton title="Criar conta" onPress={onSubmit} loading={loading} />

            <View style={tw`items-center mt-2`}>
              <Text style={tw`text-gray-600`}>Já possui conta?</Text>
              <Link href="/(auth)/login" asChild>
                <Text style={tw`text-violet-700 font-semibold mt-1`}>Entrar</Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
