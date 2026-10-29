import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const STORAGE_KEY = 'offline-subscription-v1';
const listeners = new Set();
let writes = Promise.resolve();
export const OFFLINE_QUERY_KEYS = new Set([
  'my-files', 'my-albums', 'pdf-reader-files', 'music-player-files',
  'picture-audio', 'video-player',
]);

export function isOfflineSubscriptionValid(license, token, now = Date.now()) {
  return !!token && license?.token === token &&
    Number.isFinite(license.expiresAt) && license.expiresAt > now;
}

export async function readOfflineSubscription() {
  await writes;
  try {
    return JSON.parse(await AsyncStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function subscribeOfflineSubscription(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Persist the server's absolute purchase expiry, never "days since download".
export function saveOfflineSubscription(user, token) {
  const license = {
    token,
    expiresAt: Number(user?.is_offline_mode) === 1 && user?.offline_access_expires_at
      ? Date.parse(user.offline_access_expires_at) : null,
  };
  if (!Number.isFinite(license.expiresAt)) license.expiresAt = null;
  const operation = writes.catch(() => {}).then(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(license));
    listeners.forEach(listener => listener(license));
    return license;
  });
  writes = operation.catch(() => {});
  return operation;
}

export async function purgeOfflineMedia() {
  if (!FileSystem.documentDirectory) return;
  await Promise.all(['audio-cache/', 'video-cache/', 'pdf-cache/', 'image-cache/']
    .map(dir => FileSystem.deleteAsync(`${FileSystem.documentDirectory}${dir}`, { idempotent: true })));
}

// Check both ends: a download started before expiry must not survive it.
export async function downloadOfflineFile(remote, local, options) {
  const token = await AsyncStorage.getItem('userToken');
  const license = await readOfflineSubscription();
  if (!isOfflineSubscriptionValid(license, token)) {
    throw new Error('اعتبار دانلود آفلاین به پایان رسیده است.');
  }
  const result = await FileSystem.downloadAsync(remote, local, options);
  const currentToken = await AsyncStorage.getItem('userToken');
  if (currentToken !== token || !isOfflineSubscriptionValid(await readOfflineSubscription(), token)) {
    await FileSystem.deleteAsync(local, { idempotent: true });
    throw new Error('اعتبار دانلود آفلاین به پایان رسیده است.');
  }
  return result;
}
