import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

// EXPO_PUBLIC_API_URL overrides app.json, e.g. http://192.168.0.10:8000 for local testing.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || extra.apiUrl || 'http://10.0.2.2:8000').replace(/\/$/, '');

/** Hosts whose product QR codes / links the app accepts. */
export const WEB_HOSTS = [...(extra.webHosts ?? []), API_URL.replace(/^https?:\/\//, '').split('/')[0]].map((h) => h.toLowerCase());
