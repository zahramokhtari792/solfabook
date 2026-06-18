import { useMemo } from 'react';

export const useVideoSource = (localUri, remoteUri, token, sourceType) => {
  return useMemo(() => {
    if (!remoteUri) return undefined;

    if (sourceType === 'local' && localUri) {
      return { uri: localUri };
    }

    return {
      uri: encodeURI(remoteUri),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    };
  }, [localUri, remoteUri, token, sourceType]);
};
