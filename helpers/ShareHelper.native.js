import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import Share from 'react-native-share';

const getFileNameFromUrl = (url) => {
  if (!url) {
    return `share-${Date.now()}`;
  }

  try {
    const pathname = new URL(url).pathname;
    const fileName = pathname.split('/').filter(Boolean).pop();
    return fileName || `share-${Date.now()}`;
  } catch {
    const fileName = url.split('/').filter(Boolean).pop();
    return fileName || `share-${Date.now()}`;
  }
};

const downloadFileForShare = async (fromUrl, fileName) => {
  const localPath = `${FileSystem.cacheDirectory}${fileName}`;
  const { uri } = await FileSystem.downloadAsync(encodeURI(fromUrl), localPath);
  return uri;
};

export const shareContent = async (options = {}) => {
  const { title, message, originalUrl, fileUri, type } = options;
  const resolvedFileUri = fileUri || (originalUrl ? await downloadFileForShare(originalUrl, getFileNameFromUrl(originalUrl)) : undefined);

  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title,
        text: message,
        url: originalUrl || resolvedFileUri,
      });
      return;
    }

    if (originalUrl && typeof window !== 'undefined') {
      window.open(originalUrl, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  await Share.open({
    title,
    message,
    url: resolvedFileUri,
    type,
  });
};