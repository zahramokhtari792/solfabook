import * as FileSystem from 'expo-file-system';
import { dlUrl } from '../services/URL';

const cacheDir = `${FileSystem.documentDirectory}image-cache/`;

export const cacheImage = async (path) => {
  if (!path) return null;

  await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });

  const name = path.split('/').pop();
  const local = `${cacheDir}${name}`;
  const info = await FileSystem.getInfoAsync(local);

  if (info.exists) return info.uri;

  const remote = `${dlUrl}/${path}`;
  const res = await FileSystem.downloadAsync(remote, local);
  return res.uri;
};
