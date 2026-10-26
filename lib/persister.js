import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  OFFLINE_QUERY_KEYS, isOfflineSubscriptionValid, readOfflineSubscription,
} from '../services/offlineSubscription';

const storagePersister = createAsyncStoragePersister({ storage: AsyncStorage });

export const persister = {
  ...storagePersister,
  async restoreClient() {
    const [client, license, token] = await Promise.all([
      storagePersister.restoreClient(),
      readOfflineSubscription(),
      AsyncStorage.getItem('userToken'),
    ]);
    if (!client?.clientState?.queries) return client;
    const valid = isOfflineSubscriptionValid(license, token);
    return {
      ...client,
      clientState: {
        ...client.clientState,
        queries: client.clientState.queries.filter(query => {
          if (!OFFLINE_QUERY_KEYS.has(query.queryKey[0])) return true;
          // Library keys end in the owning account's token.
          return valid && query.queryKey[query.queryKey.length - 1] === token;
        }),
      },
    };
  },
};
