import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Video from 'react-native-video';
import axios from 'axios';
import * as Linking from 'expo-linking';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../context/ThemeProvider';
import { useLoginModal } from '../context/LoginProvider';
import { mainUri, uri } from '../services/URL';
import { formatDateTime } from '../helpers/Common';

export default function RewardedAdPanel({ onRewardGranted }) {
    const { colors } = useAppTheme();
    const { showModal } = useLoginModal();
    const token = useSelector(state => state.auth?.token);
    const [status, setStatus] = useState(null);
    const [session, setSession] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const lastHeartbeatPosition = useRef(-10);
    const heartbeatPending = useRef(false);
    const completing = useRef(false);
    const cancelRef = useRef(false);
    const auth = { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } };

    const loadStatus = useCallback(async () => {
        try {
            const response = token
                ? await axios.get(`${uri}/rewarded-ads/status`, {
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                })
                : await axios.get(`${uri}/rewarded-ads/public`, {
                    headers: { Accept: 'application/json' },
                });
            setStatus(response.data);
            setMessage('');
        } catch (error) {
            setStatus(null);
            setMessage('دریافت وضعیت تبلیغات انجام نشد. اتصال اینترنت را بررسی کنید.');
        }
    }, [token]);

    useFocusEffect(useCallback(() => {
        if (!session) loadStatus();
    }, [loadStatus, session]));

    const endSession = (shouldCancel = true) => {
        if (shouldCancel && session?.id && session?.session_token) {
            axios.post(`${uri}/rewarded-ads/${session.id}/cancel`, {
                session_token: session.session_token,
            }, auth).catch(() => {});
        }
        cancelRef.current = true;
        completing.current = false;
        heartbeatPending.current = false;
        setSession(null);
        setBusy(false);
        loadStatus();
    };

    useEffect(() => {
        const sub = AppState.addEventListener('change', next => {
            // Background play must never qualify as a rewarded view.
            if (next !== 'active' && session) {
                setMessage('پخش تبلیغ متوقف شد. برای دریافت پاداش، ویدئو را دوباره از ابتدا ببینید.');
                endSession();
            }
        });
        return () => sub.remove();
    }, [session]);

    const start = async () => {
        if (!token || busy || session) return;
        setBusy(true);
        setMessage('');
        try {
            const { data } = await axios.post(`${uri}/rewarded-ads/start`, {}, auth);
            cancelRef.current = false;
            lastHeartbeatPosition.current = -10;
            completing.current = false;
            heartbeatPending.current = false;
            setSession({ ...data, id: data.session_id });
        } catch (error) {
            setMessage(error?.response?.data?.message || 'فعلاً امکان شروع تبلیغ وجود ندارد.');
            loadStatus();
        } finally { setBusy(false); }
    };

    const sendHeartbeat = async (position, force = false) => {
        if (!session || cancelRef.current || heartbeatPending.current) return false;
        const second = Math.max(0, Math.floor(position));
        if (!force && second - lastHeartbeatPosition.current < 5) return true;
        heartbeatPending.current = true;
        try {
            await axios.post(`${uri}/rewarded-ads/${session.id}/heartbeat`, {
                session_token: session.session_token,
                position_seconds: second,
            }, auth);
            lastHeartbeatPosition.current = second;
            return true;
        } catch (error) {
            setMessage('ثبت پیشرفت پخش با خطا مواجه شد؛ لطفاً دوباره امتحان کنید.');
            endSession();
            return false;
        } finally { heartbeatPending.current = false; }
    };

    const complete = async () => {
        if (!session || completing.current || cancelRef.current) return;
        completing.current = true;
        setBusy(true);
        try {
            // Wait for a preceding heartbeat so final progress is not lost.
            const started = Date.now();
            while (heartbeatPending.current && Date.now() - started < 5000) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            const progressRecorded = await sendHeartbeat(session.advertisement.duration_seconds, true);
            if (!progressRecorded || cancelRef.current) throw new Error('Playback progress was not confirmed');
            const { data } = await axios.post(`${uri}/rewarded-ads/${session.id}/complete`, {
                session_token: session.session_token,
            }, auth);
            setStatus(data.status);
            setMessage('اشتراک پاداشی شما فعال شد.');
            onRewardGranted?.();
        } catch (error) {
            setMessage(error?.response?.data?.message || 'تماشای کامل توسط سرور تأیید نشد. لطفاً دوباره تلاش کنید.');
        } finally { endSession(false); }
    };

    return (
        <View style={[styles.panel, { backgroundColor: colors.optionSurface || colors.surface, borderColor: colors.border || '#ddd2c4' }]}>
            <Text style={[styles.heading, { color: colors.text }]}>دسترسی رایگان با تماشای تبلیغ</Text>
            <Text style={[styles.description, { color: colors.text }]}>
                با تماشای کامل یک ویدئو، اشتراک شما برای {status?.reward_minutes || 120} دقیقه فعال می‌شود. پس از پایان این زمان، دسترسی اشتراکی قطع خواهد شد. دانلود آفلاین غیرفعال است.
            </Text>
            {!!status?.ad_access_expires_at && (
                <Text style={[styles.description, { color: colors.text }]}>اعتبار اشتراک تا: {formatDateTime(status.ad_access_expires_at)}</Text>
            )}
            {status && !!token && <Text style={[styles.description, { color: colors.text }]}>
                پاداش باقی‌مانده امروز: {status.rewards_remaining} از {status.daily_limit}
                {!!status.next_available_at && `\nزمان مجاز بعدی: ${formatDateTime(status.next_available_at)}`}
            </Text>}
            {!!status && !status.enabled && (
                <Text style={[styles.message, { color: colors.text }]}>سیستم تبلیغات پاداش‌دار در حال حاضر غیرفعال است.</Text>
            )}
            {!!status?.enabled && !!token && !status.can_watch && (
                <Text style={[styles.message, { color: colors.text }]}>
                    {status.unavailable_reason === 'no_video' ? 'فعلاً ویدئوی تبلیغاتی فعال در بازه نمایش وجود ندارد.'
                        : status.unavailable_reason === 'paid_subscription' ? 'اشتراک پولی شما فعال است؛ نیازی به تماشای تبلیغ ندارید.'
                        : status.unavailable_reason === 'daily_limit' ? 'سقف دریافت پاداش امروز تکمیل شده است.'
                        : status.unavailable_reason === 'cooldown' ? 'برای پاداش بعدی باید تا زمان مجاز اعلام‌شده صبر کنید.'
                        : 'فعلاً امکان دریافت پاداش وجود ندارد.'}
                </Text>
            )}
            {!!status?.enabled && !token && (
                <Text style={[styles.message, { color: colors.text }]}>برای دریافت پاداش ابتدا وارد حساب کاربری شوید.</Text>
            )}
            {!!message && <Text accessibilityRole="alert" style={[styles.message, { color: colors.text }]}>{message}</Text>}
            {!!status?.enabled && ((!!token && status.can_watch) || (!token && status.has_available_ad)) && <Pressable accessibilityRole="button" onPress={!token ? showModal : start} disabled={busy}
                style={[styles.action, { backgroundColor: colors.primary || '#961D5A' }]}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>{!token ? 'ورود و دریافت اشتراک رایگان' : 'تماشای تبلیغ و دریافت اشتراک'}</Text>}
            </Pressable>}
            <Pressable accessibilityRole="link" onPress={() => Linking.openURL(`${mainUri}/advertise`)} style={styles.requestLink}>
                <Text style={[styles.requestText, { color: colors.text }]}>درخواست ثبت تبلیغ برای کسب‌وکارها</Text>
            </Pressable>
            <Modal visible={!!session} animationType="fade" onRequestClose={endSession} presentationStyle="fullScreen">
                <View style={styles.videoPage}>
                    {session && <>
                        <Text style={styles.videoTitle}>{session.advertisement?.title || 'تبلیغ'}</Text>
                        <Video
                            source={{ uri: session.advertisement.video_url }}
                            style={styles.video}
                            controls={false}
                            paused={false}
                            repeat={false}
                            resizeMode="contain"
                            progressUpdateInterval={1000}
                            onProgress={({ currentTime }) => sendHeartbeat(currentTime)}
                            onEnd={complete}
                            onError={() => { setMessage('ویدئو قابل پخش نیست.'); endSession(); }}
                        />
                        <Text style={styles.videoHint}>برای دریافت پاداش، ویدئو را تا انتها تماشا کنید.</Text>
                        <Pressable accessibilityRole="button" onPress={endSession} style={styles.close}>
                            <Text style={styles.closeText}>خروج بدون دریافت پاداش</Text>
                        </Pressable>
                    </>}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    panel: { alignSelf: 'stretch', marginHorizontal: 16, marginVertical: 18, padding: 18, borderRadius: 12, borderWidth: 1, gap: 12 },
    heading: { fontFamily: 'VazirBold', fontSize: 17, textAlign: 'center' },
    description: { fontFamily: 'VazirBold', fontSize: 14, lineHeight: 26, textAlign: 'center' },
    message: { fontFamily: 'VazirBold', fontSize: 14, lineHeight: 25, textAlign: 'center' },
    action: { minHeight: 46, borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
    actionText: { color: '#fff', fontFamily: 'VazirBold', fontSize: 14 },
    requestLink: { paddingVertical: 8, alignItems: 'center' },
    requestText: { fontFamily: 'VazirBold', fontSize: 14, textAlign: 'center', textDecorationLine: 'underline' },
    videoPage: { flex: 1, justifyContent: 'center', alignItems: 'stretch', backgroundColor: '#000', paddingTop: 45, paddingBottom: 35 },
    videoTitle: { color: '#fff', fontFamily: 'VazirBold', textAlign: 'center', fontSize: 16, marginVertical: 12 },
    video: { flex: 1, width: '100%' },
    videoHint: { color: '#fff', fontFamily: 'VazirBold', textAlign: 'center', fontSize: 13, padding: 10 },
    close: { alignSelf: 'center', borderRadius: 8, backgroundColor: '#333', padding: 12 },
    closeText: { fontFamily: 'VazirBold', fontSize: 14, color: '#fff' },
});
