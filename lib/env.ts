import { Platform } from 'react-native';

function truthy(v?: string | null) {
  if (!v) return false;
  const s = String(v).trim();
  return /^(1|true|yes|on)$/i.test(s);
}

function normalizeEnvName(raw?: string | null): 'development' | 'production' | 'staging' {
  const s = (raw || '').toLowerCase();
  if (s.startsWith('dev')) return 'development';
  if (s.startsWith('prod')) return 'production';
  if (s.startsWith('stage')) return 'staging';
  return (process.env.NODE_ENV === 'development' ? 'development' : 'production');
}

export const APP_ENV = normalizeEnvName(process.env.EXPO_PUBLIC_ENV || process.env.NODE_ENV);
export const SHOW_ERROR_DETAILS = truthy(process.env.EXPO_PUBLIC_DEBUG_ERRORS) || APP_ENV === 'development';
export const IS_DEV = APP_ENV === 'development';
export const IS_PROD = APP_ENV === 'production';
export const IS_WEB = Platform.OS === 'web';
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
