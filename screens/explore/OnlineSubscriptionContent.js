import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, Image, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Video from 'react-native-video';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useAppTheme } from '../../context/ThemeProvider';
import { uri } from '../../services/URL';

const contentTypeLabel = { audio: 'صوت', video: 'ویدئو', pdf: 'PDF', image: 'تصویر' };
const EXPIRY_CHECK_MS = 15000;

export default function OnlineSubscriptionContent({ route, navigation }) {
  const { colors } = useAppTheme();
  const token = useSelector(state => state.auth?.token);
  const fileId = route.params?.id;
  const [manifest, setManifest] = useState(null);
  const [active, setActive] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}`, Accept: 'application/json' }), [token]);

  const refresh = useCallback(async () => {
    if (!token || !fileId) return;
    try {
      const res = await axios.get(`${uri}/ad-online/files/${fileId}/media`, { headers });
      setManifest(res.data);
      setError('');
    } catch (err) {
      setManifest(null); setActive(null);
      setError(err?.response?.status === 403 ? 'زمان دسترسی تبلیغاتی پایان یافته است. برای ادامه یک تبلیغ جدید ببینید.' : 'امکان دریافت محتوای آنلاین وجود ندارد.');
    } finally { setLoading(false); }
  }, [fileId, token, headers]);

  useFocusEffect(useCallback(() => {
    let focused = true;
    refresh();
    const interval = setInterval(() => { if (focused) refresh(); }, EXPIRY_CHECK_MS);
    return () => { focused = false; clearInterval(interval); setActive(null); };
  }, [refresh]));

  const play = item => {
    if (item.type === 'pdf') {
      navigation.navigate('SamplePDFReader', {
        sample_files: [{ file_path: item.stream_url }],
        secureHeaders: { Authorization: `Bearer ${token}` },
        onlineExpiresAt: manifest?.online_only ? manifest?.expires_at : null,
      });
      return;
    }

    setActive(item);
  };

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, padding: 18 },
    title: { color: colors.text, fontSize: 18, marginBottom: 12, textAlign: 'center' },
    secondary: { color: colors.textSecondary || colors.text, fontSize: 13, textAlign: 'center', marginBottom: 18 },
    row: { padding: 16, borderRadius: 10, backgroundColor: colors.optionSurface || colors.surface, marginBottom: 11 },
    rowText: { color: colors.text, fontSize: 14, textAlign: 'right' },
    player: { width: '100%', height: 230, backgroundColor: '#111', borderRadius: 10, marginBottom: 18 },
  }), [colors]);

  if (loading) return <View style={styles.root}><ActivityIndicator /></View>;
  if (error) return <View style={styles.root}><Text style={styles.title}>{error}</Text><Pressable onPress={refresh}><Text style={styles.secondary}>تلاش مجدد</Text></Pressable></View>;
  return <View style={styles.root}>
    <Text style={styles.title}>{manifest?.title || 'مطالعه و پخش آنلاین'}</Text>
    <Text style={styles.secondary}>این دسترسی موقت است؛ ذخیره آفلاین و افزودن به کتابخانه انجام نمی‌شود.</Text>
    {active && active.type === 'image' ? <Image key={active.id} source={{ uri: active.stream_url, headers: { Authorization: `Bearer ${token}` } }} style={styles.player} resizeMode="contain" /> : null}
    {active && active.type !== 'image' ? <Video key={active.id} source={{ uri: active.stream_url, headers: { Authorization: `Bearer ${token}` } }} style={styles.player} controls paused={false} playInBackground={false} resizeMode="contain" onError={() => Alert.alert('خطای پخش', 'پخش فایل آنلاین انجام نشد.')} /> : null}
    <FlatList data={manifest?.items || []} keyExtractor={item => String(item.id)} renderItem={({ item }) => <Pressable onPress={() => play(item)} style={styles.row}>
      <Text style={styles.rowText}>{contentTypeLabel[item.type] || 'فایل'} — {item.title || 'بدون عنوان'}</Text>
    </Pressable>} ListEmptyComponent={<Text style={styles.secondary}>فایل آنلاینی برای این مورد ثبت نشده است.</Text>} />
  </View>;
}
