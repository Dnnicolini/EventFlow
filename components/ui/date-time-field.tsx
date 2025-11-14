import React, { useMemo, useState } from 'react';
import { Platform, Pressable, Text, View, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid, AndroidNativeProps } from '@react-native-community/datetimepicker';
import { CalendarDays, Clock } from 'lucide-react-native';
import tw from '@/lib/tw';

type Mode = 'date' | 'time';

type Props = {
  mode: Mode;
  value?: string | Date | null;
  onChange?: (formatted: string, date: Date) => void;
  placeholder?: string;
};

function toDate(value?: string | Date | null) {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }
  if (/^\d{2}:\d{2}$/.test(value)) {
    const [hh, mm] = value.split(':').map(Number);
    const d = new Date();
    d.setHours(hh || 0, mm || 0, 0, 0);
    return d;
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function fmt(mode: Mode, date: Date) {
  if (mode === 'date') {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return { display: `${dd}/${mm}/${yyyy}`, value: `${yyyy}-${mm}-${dd}` };
  }
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return { display: `${hh}:${mm}`, value: `${hh}:${mm}` };
}

export default function DateTimeField({ mode, value, onChange, placeholder }: Props) {
  const initial = useMemo(() => toDate(value), [value]);
  const [iosOpen, setIosOpen] = useState(false);
  const iconColor = tw.color('gray-600') || '#4B5563';
  const Icon = mode === 'date' ? CalendarDays : Clock;

  const formatted = fmt(mode, initial);

  const openPicker = () => {
    if (Platform.OS === 'android') {
      const options: AndroidNativeProps = {
        value: toDate(value),
        mode,
        is24Hour: true,
        onChange: (_e, selected) => {
          if (!selected) return;
          const f = fmt(mode, selected);
          onChange?.(f.value, selected);
        },
      };
      DateTimePickerAndroid.open(options);
    } else {
      setIosOpen(true);
    }
  };

  return (
    <View>
      <Pressable onPress={openPicker} style={tw`h-12 rounded-full bg-gray-200 px-4 flex-row items-center`}>
        <Icon size={18} color={iconColor} />
        <Text style={tw`ml-2 text-gray-900`}>
          {value ? formatted.display : placeholder || (mode === 'date' ? 'Selecionar data' : 'Selecionar hora')}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' && (
        <Modal visible={iosOpen} transparent animationType="slide" onRequestClose={() => setIosOpen(false)}>
          <Pressable style={tw`flex-1 bg-black/40`} onPress={() => setIosOpen(false)} />
          <View style={tw`bg-white p-4`}> 
            <DateTimePicker
              value={toDate(value)}
              mode={mode}
              is24Hour
              display="spinner"
              onChange={(_e, d) => {
                const selected = d || toDate(value);
                const f = fmt(mode, selected);
                onChange?.(f.value, selected);
              }}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}
