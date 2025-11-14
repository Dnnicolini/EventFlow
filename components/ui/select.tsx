import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import tw from '@/lib/tw';
import { ChevronDown } from 'lucide-react-native';

type Option<T> = { label: string; value: T };

type Props<T> = {
  label?: string;
  options: Option<T>[];
  value?: T;
  onChange?: (v: T) => void;
};

export default function Select<T>({ label, options, value, onChange }: Props<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View>
      {label ? <Text style={tw`mb-1 text-gray-700`}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen((s) => !s)}
        style={tw`h-12 rounded-lg border border-gray-300 px-3 flex-row items-center justify-between`}
      >
        <Text style={tw`text-gray-800`}>
          {current ? current.label : 'Selecione'}
        </Text>
        <ChevronDown size={18} color={tw.color('gray-600') || '#475569'} />
      </Pressable>
      {open && (
        <View style={tw`mt-1 rounded-lg border border-gray-300 bg-white max-h-48`}>
          <ScrollView>
            {options.map((item, idx) => (
              <Pressable
                key={String((item as any).value ?? idx)}
                onPress={() => {
                  onChange?.(item.value);
                  setOpen(false);
                }}
                style={tw`px-3 py-2`}
              >
                <Text style={tw`text-gray-800`}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
