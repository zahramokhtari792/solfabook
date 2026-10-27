import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Video from 'react-native-video';
import axios from 'axios';
import * as Linking from 'expo-linking';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchUser } from '../slices/userSlice';
import { langIsRTL } from '../styles/NewStyles';
import { useFocusEffect } from '@react-navigation/native';
import { useAppTheme } from '../context/ThemeProvider';
import { useLoginModal } from '../context/LoginProvider';
import { mainUri, uri } from '../services/URL';
import { formatDateTime } from '../helpers/Common';

export default function RewardedAdPanel({ onRewardGranted }) {
    const { colors } = useAppTheme();
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const fontFamily = langIsRTL(i18n.resolvedLanguage || i18n.language || 'en') ? 'VazirBold' : 'VazirThin';
    const { showModal } = useLoginModal();
    const token = useSelector(state => state.auth?.token);
    const [status, setStatus] = useState(null);
    const statusRequestId = useRef(0);
    const [session, setSession] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const lastHeartbeatPosition = useRef(-10);
    const heartbeatPending = useRef(false);
    const completing = useRef(false);
    const cancelRef = useRef(false);
    const auth = { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } };

    const loadStatus = useCallback(async () => {
        const requestId = ++statusRequestId.current;
        try {
            const response = token
                ? await axios.get(`${uri}/rewarded-ads/status`, {
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
                })
                : await axios.get(`${uri}/rewarded-ads/public`, {
                    headers: { Accept: 'application/json' },
                });
            if (requestId !== statusRequestId.current) return;
            setStatus(response.data);
        } catch (error) {
            if (requestId !== statusRequestId.current) return;
            setStatus(null);
            setMessage("Could not load ad availability. Check your internet connection.");
        }
    }, [token]);

    useFocusEffect(useCallback(() => {
        if (session) return undefined;
        loadStatus();
        // A focused screen can remain mounted across midnight/cooldown expiry.
        // Refresh without making the user navigate away and back.
        const timer = setInterval(loadStatus, 60 * 1000);
        const appState = AppState.addEventListener('change', next => {
            if (next === 'active') loadStatus();
        });
        return () => {
            clearInterval(timer);
            appState.remove();
            statusRequestId.current += 1;
        };
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
                setMessage("The advertisement stopped. Watch the video again from the beginning to activate your free subscription.");
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
            setMessage(error?.response?.status === 429
                ? "Too many requests. Please try again shortly."
                : "The advertisement cannot be started right now. Please try again.");
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
            setMessage("Could not record playback progress. Please try again.");
            endSession();
            return false;
        } finally { heartbeatPending.current = false; }
    };

    const complete = async () => {
        if (!session || completing.current || cancelRef.current) return;
        completing.current = true;
        setBusy(true);
        let confirmedByServer = false;
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
            confirmedByServer = true;
            setStatus(data.status);
            setMessage("Your free subscription is active with all features.");
            // Refresh feature flags and persist the reward's exact offline expiry.
            await dispatch(fetchUser(token));
            onRewardGranted?.();
        } catch (error) {
            if (!confirmedByServer) {
                const errorMessage = error?.response?.status === 429
                    ? "Too many requests. Please try again shortly."
                    : "The server could not confirm the complete view. Please try again.";
                setMessage(errorMessage);
            }
        } finally {
            // A failed completion must cancel the server session. A confirmed
            // reward must not be cancelled even if a UI callback fails.
            endSession(!confirmedByServer);
        }
    };

    // While no viewing opportunity is available, hide the entire feature.
    // Keep an already-started video mounted until it finishes or is cancelled.
    const canShowOffer = !!status?.enabled && !!status?.has_available_ad
        && (!token || status?.can_watch === true);
    if (!session && !canShowOffer) return null;

    return (
        <View style={[styles.panel, { backgroundColor: colors.optionSurface || colors.surface, borderColor: colors.border || '#ddd2c4' }]}>
            <Text style={[styles.heading, { color: colors.text, fontFamily }]}>{t("Free subscription by watching a video")}</Text>
            <Text style={[styles.description, { color: colors.text, fontFamily }]}>
                {t("Watch a complete video to activate a subscription with offline downloads and dictionary access for {{minutes}} minutes. Access and offline files expire when this period ends.", { minutes: status?.reward_minutes || 120 })}
            </Text>
            {!!status?.ad_access_expires_at && (
                <Text style={[styles.description, { color: colors.text, fontFamily }]}>{t("Subscription valid until: {{date}}", { date: formatDateTime(status.ad_access_expires_at) })}</Text>
            )}
            {!!status?.enabled && !token && (
                <Text style={[styles.message, { color: colors.text, fontFamily }]}>{t("Sign in first to activate your free subscription.")}</Text>
            )}
            {!!message && <Text accessibilityRole="alert" style={[styles.message, { color: colors.text, fontFamily }]}>{t(message)}</Text>}
            {!!status?.enabled && ((!!token && status.can_watch) || (!token && status.has_available_ad)) && <Pressable accessibilityRole="button" onPress={!token ? showModal : start} disabled={busy}
                style={[styles.action, { backgroundColor: colors.primary || '#961D5A' }]}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={[styles.actionText, { fontFamily }]}>{t(!token ? "Sign in and activate free subscription" : "Watch a video and activate subscription")}</Text>}
            </Pressable>}
            <Pressable accessibilityRole="link" onPress={() => Linking.openURL(`${mainUri}/advertise`)} style={styles.requestLink}>
                <Text style={[styles.requestText, { color: colors.text, fontFamily }]}>{t("Advertise your business")}</Text>
            </Pressable>
            <Modal visible={!!session} animationType="fade" onRequestClose={endSession} presentationStyle="fullScreen">
                <View style={styles.videoPage}>
                    {session && <>
                        <Text style={[styles.videoTitle, { fontFamily }]}>{session.advertisement?.title || t("Advertisement")}</Text>
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
                            onError={() => { setMessage("The video could not be played."); endSession(); }}
                        />
                        <Text style={[styles.videoHint, { fontFamily }]}>{t("Watch the entire video to activate your free subscription.")}</Text>
                        <Pressable accessibilityRole="button" onPress={endSession} style={styles.close}>
                            <Text style={[styles.closeText, { fontFamily }]}>{t("Exit without activating subscription")}</Text>
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
