import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { dlUrl } from '../services/URL';

export const getVideoCachePaths = (item, index) => {
  const trackId = item?.id ?? item?.file_gallery_id ?? index;
  const cacheDir = `${FileSystem.documentDirectory}video-cache/`;
  const fileName = item?.file_path ? item.file_path.split('/').pop() : `${trackId}.bin`;
  const safeFile = `${trackId}_${fileName}`;
  const localPath = `${cacheDir}${safeFile}`;
  const metaPath = `${localPath}.json`;
  return { trackId, localPath, metaPath };
};

export const ensureDir = async () => {
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}video-cache/`, { intermediates: true });
};

export const readMeta = async (metaPath) => {
  try {
    const txt = await FileSystem.readAsStringAsync(metaPath);
    return JSON.parse(txt);
  } catch {
    return null;
  }
};

export const writeMeta = async (metaPath, meta) => {
  try {
    await FileSystem.writeAsStringAsync(metaPath, JSON.stringify(meta));
  } catch { }
};

export const deleteVideoCache = async (localPath, metaPath) => {
  await FileSystem.deleteAsync(localPath, { idempotent: true });
  await FileSystem.deleteAsync(metaPath, { idempotent: true });
};

export const isVideoValid = async (localPath, metaPath, remoteUri, token) => {
  const info = await FileSystem.getInfoAsync(localPath);
  const meta = await readMeta(metaPath);

  if (!(info.exists)) return false;

  const localSize = info.size ?? 0;

  if (meta?.contentLength) {
    return Number(meta.contentLength) === Number(localSize);
  }

  // fetch HEAD to verify
  try {
    const head = await axios.head(remoteUri, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    const len = Number(
      head?.headers?.['content-length'] ||
      head?.headers?.['Content-Length'] ||
      0
    );
    if (len > 0) return len === localSize;
  } catch { }

  return true; // fallback (can't verify)
};

export const downloadVideo = async (item, index, token) => {
  await ensureDir();
  const remoteUri = `${dlUrl}/${item.file_path}`;
  const { localPath, metaPath } = getVideoCachePaths(item, index);

  const result = await FileSystem.downloadAsync(remoteUri, localPath, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  const size = (await FileSystem.getInfoAsync(localPath)).size;

  await writeMeta(metaPath, {
    contentLength: size,
    contentType: result?.headers?.['content-type'] || null
  });

  return localPath;
};
