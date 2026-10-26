import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../slices/userSlice';
import { useInternetStatus } from '../hooks/useInternetStatus';
import { useAppTheme } from '../context/ThemeProvider';
import Loader from './Loader';
import { queryClient } from '../lib/queryClient';
import {
  OFFLINE_QUERY_KEYS, isOfflineSubscriptionValid, purgeOfflineMedia,
  readOfflineSubscription, subscribeOfflineSubscription,
} from '../services/offlineSubscription';

const OfflineSubscriptionContext = createContext({ ready: false, valid: false });

export default function OfflineSubscriptionProvider({ children }) {
  const token = useSelector(state => state.auth?.token);
  const dispatch = useDispatch();
  const online = useInternetStatus();
  const [resume, setResume] = useState(0);
  const [license, setLicense] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [prepared, setPrepared] = useState(null);
  const valid = isOfflineSubscriptionValid(license, token, now);
  const signature = JSON.stringify([token, license?.expiresAt, valid]);

  useEffect(() => {
    let live = true;
    const unsubscribe = subscribeOfflineSubscription(value => {
      if (live) { setLicense(value); setNow(Date.now()); }
    });
    readOfflineSubscription().then(value => {
      if (live) { setLicense(value); setLoaded(true); setNow(Date.now()); }
    });
    return () => { live = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (loaded && token && online) dispatch(fetchUser(token));
  }, [loaded, token, online, resume, dispatch]);

  useEffect(() => {
    if (!loaded || !token) return;
    let live = true;
    const prepare = async () => {
      // An upgrade without a saved licence needs one online verification.
      // Keep existing downloads until that check, but deny offline playback.
      if (!valid && license?.token === token) {
        const predicate = query => OFFLINE_QUERY_KEYS.has(query.queryKey[0]);
        await queryClient.cancelQueries({ predicate });
        queryClient.removeQueries({ predicate });
        await purgeOfflineMedia();
      }
      if (live) setPrepared(signature);
    };
    // Keep readers closed if deleting expired files fails; retry on resume.
    prepare().catch(() => {});
    return () => { live = false; };
  }, [loaded, token, valid, signature, resume]);

  useEffect(() => {
    let timeout;
    const check = () => {
      clearTimeout(timeout);
      const current = Date.now();
      setNow(current);
      if (license?.expiresAt > current) {
        // Long subscriptions exceed the native timer limit; always recheck.
        timeout = setTimeout(check, Math.min(license.expiresAt - current + 1, 2147483647));
      }
    };
    check();
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') { check(); setResume(value => value + 1); }
    });
    return () => { clearTimeout(timeout); listener.remove(); };
  }, [license]);

  return (
    <OfflineSubscriptionContext.Provider value={{ ready: !token || (loaded && prepared === signature && (license?.token === token || !online)), valid }}>
      {children}
    </OfflineSubscriptionContext.Provider>
  );
}

export function withOfflineSubscription(Screen) {
  return function OfflineSubscriptionScreen(props) {
    const { ready, valid } = useContext(OfflineSubscriptionContext);
    const online = useInternetStatus();
    const { colors } = useAppTheme();
    if (!ready) return <Loader />;
    if (!online && !valid) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: colors.text, textAlign: 'center', fontFamily: 'VazirThin', lineHeight: 26 }}>
            برای استفاده آفلاین، اشتراک معتبر لازم است. برای دریافت وضعیت اشتراک یا تمدید آن به اینترنت متصل شوید.
          </Text>
        </View>
      );
    }
    return <Screen {...props} />;
  };
}
