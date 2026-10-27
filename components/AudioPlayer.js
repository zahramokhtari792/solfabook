import { downloadOfflineFile } from '../services/offlineSubscription';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import Video from 'react-native-video';
import * as FileSystem from 'expo-file-system';

import { useNewStyles } from '../styles/NewStyles';
import { themeColor0, themeColor1 } from '../theme/Color';
import { useAppTheme } from '../context/ThemeProvider';
import PlayBackIcon from '../assets/svg/PlayBackIcon';
import PlayForwardIcon from '../assets/svg/PlayForwardIcon';
import { dlUrl } from '../services/URL';
import { useTranslation } from 'react-i18next';
import { CaptureProtection, CaptureEventType } from '../helpers/CaptureProtection';

/**
 * Global: Only one audio plays at a time (across screens/components)
 */
let currentlyPlayingKey = null;
const listeners = new Set();
const notifyPlaying = (key) => {
    currentlyPlayingKey = key;
    listeners.forEach((fn) => fn(key));
};
const subscribePlaying = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};

export default function AudioPlayer({
    audio,
    index,
    setIndex,
    playing,
    setPlaying,
    maxPreviewSeconds,
    preferLocalMap,
    downloadedTracks,
    initialLocalUri,
    initialSourceType,
    playNow,
}) {
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useNewStyles(lang);
    const { colors, isDark } = useAppTheme();
    // Preserve the brand purple in Light; keep player labels and icons readable in Dark.
    const controlColor = isDark ? colors.text : themeColor0.bgColor(1);

    const playerRef = useRef(null);
    const isSeekingRef = useRef(false);
    const wasPlayingRef = useRef(false);
    const currentSourceRef = useRef('remote');
    const [sourceType, setSourceType] = useState('remote');

    // Per instance stable key (for global single-play)
    const instanceKeyRef = useRef(`ap_${Math.random().toString(16).slice(2)}_${Date.now()}`);
    const instanceKey = instanceKeyRef.current;

    // ms
    const [total, setTotal] = useState(0);
    const [width, setWidth] = useState(0);
    const [tempWidth, setTempWidth] = useState(0);

    const [isSeeking, setIsSeeking] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadingErr, setLoadingErr] = useState(null);
    const [pendingPlay, setPendingPlay] = useState(false);
    const [rate, setRate] = useState(1);

    // Let the native slider own the thumb while dragging. Ignore stale player
    // progress until a seek is confirmed by the native player.
    const seekTargetRef = useRef(null); // requested position, in ms
    const seekIssuedAtRef = useRef(null);
    const confirmedSeekRef = useRef(null); // { positionMs, confirmedAt }

    const remotePath = audio?.[index]?.file_path ?? '';
    const remoteUri = remotePath ? `${dlUrl}/${remotePath}` : '';
    const cacheDir = `${FileSystem.documentDirectory}audio-cache/`;
    const fileName = remotePath ? remotePath.split('/').pop() : null;
    const trackId = audio?.[index]?.id ?? audio?.[index]?.file_gallery_id ?? index;
    const safeFileName = fileName ? `${trackId}_${fileName}` : `${trackId}.bin`;
    const localPath = `${cacheDir}${safeFileName}`;
    const localDonePath = `${localPath}.complete`;
    const [localUri, setLocalUri] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const limitMs = Number.isFinite(maxPreviewSeconds) && maxPreviewSeconds > 0
        ? maxPreviewSeconds * 1000
        : null;

    const prev = () => setIndex((i) => Math.max(i - 1, 0));
    const next = () => setIndex((i) => Math.min(i + 1, (audio?.length ?? 1) - 1));



    const checkIsRecording = async () => {
        try {
            const status = await CaptureProtection.isScreenRecording();
            console.log('Protection Status:', status);
            console.log('Screen recording or screenshots are not allowed during audio playback.');

        } catch (e) {
            console.log(e);


        }

    }

    // Reset on track change
    useEffect(() => {
        setTotal(0);
        setWidth(0);
        setTempWidth(0);
        setIsSeeking(false);
        isSeekingRef.current = false;
        setIsLoaded(false);
        setLoadingErr(null);
        seekTargetRef.current = null;
        seekIssuedAtRef.current = null;
        confirmedSeekRef.current = null;
        currentSourceRef.current = 'remote';
        setSourceType('remote');
        setLocalUri(null);
        setIsDownloading(false);
        setPendingPlay(false);
    }, [remotePath, index]);

    // Apply initial source/local when provided by parent (e.g., MusicPlayer precheck)
    useEffect(() => {
        if (initialLocalUri) {
            setLocalUri(initialLocalUri);
        }
        if (initialSourceType === 'local' || initialSourceType === 'remote') {
            currentSourceRef.current = initialSourceType;
            setSourceType(initialSourceType);
        }
    }, [initialLocalUri, initialSourceType, trackId]);

    // Check for cached file on track change
    useEffect(() => {
        let active = true;
        if (!localPath) return () => { active = false; };

        (async () => {
            try {
                await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
                const info = await FileSystem.getInfoAsync(localPath);
                const doneInfo = await FileSystem.getInfoAsync(localDonePath);
                if (active && info.exists && doneInfo.exists) {
                    setLocalUri(info.uri);
                }
            } catch (e) {
                // ignore cache check errors
            }
        })();

        return () => { active = false; };
    }, [cacheDir, localPath]);

    // Refresh local cache state when a track is downloaded externally
    useEffect(() => {
        let active = true;
        if (!downloadedTracks || !downloadedTracks[trackId] || !localPath) return () => { active = false; };
        (async () => {
            try {
                const info = await FileSystem.getInfoAsync(localPath);
                const doneInfo = await FileSystem.getInfoAsync(localDonePath);
                if (active && info.exists && doneInfo.exists) {
                    setLocalUri(info.uri);
                }
            } catch (e) {
                // ignore
            }
        })();
        return () => { active = false; };
    }, [downloadedTracks, trackId, localPath, localDonePath]);

    // Global single-play: when another player starts, pause this
    useEffect(() => {
        const unsub = subscribePlaying((activeKey) => {
            if (activeKey !== instanceKey) {
                if (playing) setPlaying(false);
            }
        });
        return unsub;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instanceKey, playing]);

    // Stop audio if screen recording starts
    useEffect(() => {
        const sub = CaptureProtection.addListener((eventType) => {
            if (eventType === CaptureEventType.RECORDING) {
                setPlaying(false);
            }
        });

        return () => {
            sub?.remove?.();
        };
    }, [setPlaying]);

    // Prevent screen recording while audio is playing
    useEffect(() => {
        CaptureProtection.prevent();
        return () => CaptureProtection.allow();
    }, []);

    const pauseSound = useCallback(() => {
        setPlaying(false);
    }, [setPlaying]);

    const playSound = useCallback(() => {
        // pause others
        notifyPlaying(instanceKey);

        console.log('[AudioPlayer] playSound', {
            source: currentSourceRef.current === 'local' ? 'LOCAL' : 'REMOTE',
            uri: currentSourceRef.current === 'local' && localUri ? localUri : remoteUri,
            index,
            remotePath,
            localPath,
            localUri,
            total,
            width,
            isLoaded,
        });

        // restart if near end
        if (total > 0 && width >= total - 1500) {
            seekTargetRef.current = 0;
            seekIssuedAtRef.current = Date.now();
            confirmedSeekRef.current = null;
            setIsSeeking(true);
            isSeekingRef.current = true;
            playerRef.current?.seek(0);
            setWidth(0);
            setTempWidth(0);
            // unlock will happen via onProgress reaching 0
        }

        setPlaying(true);
    }, [instanceKey, setPlaying, total, width]);

    const ensureLocalUri = useCallback(async () => {
        if (!localPath || !remoteUri) return false;
        if (localUri) return true;
        if (isDownloading) return false;

        console.log('[AudioPlayer] Download start', {
            index,
            remotePath,
            remoteUri,
            localPath,
        });
        setIsDownloading(true);
        setLoadingErr(null);
        try {
            await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
            const info = await FileSystem.getInfoAsync(localPath);
            const done = await FileSystem.getInfoAsync(localDonePath);
            if (info.exists && done.exists) {
                console.log('[AudioPlayer] Cache hit', {
                    index,
                    remotePath,
                    localPath,
                    uri: info.uri,
                    size: info.size,
                });
                setLocalUri(info.uri);
                return true;
            }
            // Not a valid completed cache -> remove stale marker before download
            if (done.exists) {
                await FileSystem.deleteAsync(localDonePath, { idempotent: true });
            }

            const encoded = encodeURI(remoteUri);
            const { uri: downloadedUri } = await downloadOfflineFile(encoded, localPath);
            await FileSystem.writeAsStringAsync(localDonePath, 'ok', { encoding: FileSystem.EncodingType.UTF8 });
            setLocalUri(downloadedUri);
            return true;
        } catch (e) {
            console.log('[AudioPlayer] Download error', {
                index,
                remotePath,
                localPath,
                error: e?.message ?? e,
            });
            try {
                await FileSystem.deleteAsync(localPath, { idempotent: true });
                await FileSystem.deleteAsync(localDonePath, { idempotent: true });
            } catch (cleanupErr) {
                // ignore cleanup errors
            }
            setLoadingErr('Audio download error');
            return false;
        } finally {
            console.log('[AudioPlayer] Download end', {
                index,
                remotePath,
                localPath,
                isDownloading: false,
            });
            setIsDownloading(false);
        }
    }, [cacheDir, isDownloading, localPath, localUri, remoteUri]);

    const wantsLocal = (
        (preferLocalMap && preferLocalMap[trackId] === true) ||
        (downloadedTracks && downloadedTracks[trackId] === true)
    );
    const shouldUseLocal = !!localUri && wantsLocal;

    // Enforce local playback when local is preferred or already downloaded
    useEffect(() => {
        if (!playing) return;
        if (wantsLocal) {
            if (!localUri) {
                if (!pendingPlay) setPendingPlay(true);
                setPlaying(false);
                return;
            }
            if (sourceType !== 'local') {
                setPlaying(false);
                currentSourceRef.current = 'local';
                setSourceType('local');
                setPendingPlay(true);
            }
        }
    }, [playing, wantsLocal, trackId, localUri, sourceType, pendingPlay, setPlaying]);

    const handlePlayPress = useCallback(async () => {
        console.log('[AudioPlayer] Play pressed', {
            index,
            remotePath,
            remoteUri,
            cacheDir,
            fileName,
            localPath,
            localUri,
            isDownloading,
            isLoaded,
            pendingPlay,
            playing,
        });
        try {
            const isRecording = await CaptureProtection.isScreenRecording();
            if (isRecording) {
                setPlaying(false);
                return;
            }
        } catch (e) {
            // Ignore recording check errors and proceed
        }
        if (wantsLocal) {
            if (!localUri) {
                setPendingPlay(true);
                return;
            }
            currentSourceRef.current = 'local';
            setSourceType('local');
            playSound();
            return;
        }
        currentSourceRef.current = 'remote';
        setSourceType('remote');
        playSound();
    }, [wantsLocal, localUri, playSound]);

    // playNow is handled by parent screens; AudioPlayer does not consume it directly.

    // Start playback once localUri becomes available
    useEffect(() => {
        if (!pendingPlay) return;
        if (!localUri) return;
        console.log('[AudioPlayer] pendingPlay resolved -> start', {
            index,
            remotePath,
            localPath,
            localUri,
        });
        currentSourceRef.current = 'local';
        setSourceType('local');
        playSound();
        setPendingPlay(false);
    }, [localUri, pendingPlay, playSound]);

    const millisToMinutesAndSeconds = (millis) => {
        const safe = Number.isFinite(millis) ? Math.max(0, millis) : 0;
        const minutes = Math.floor(safe / 60000);
        const seconds = Math.floor((safe % 60000) / 1000);
        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    };

    const SLIDER_STEP_MS = 100;
    // seekableDuration changes while streaming; using it as maximumValue
    // makes the slider range (and thumb position) jump during a drag.
    const maxSeekMs = total > 0 ? total : 0;

    const finishSeek = (positionMs) => {
        const target = seekTargetRef.current;
        if (typeof target !== 'number') return;

        const confirmedMs = Number.isFinite(positionMs)
            ? Math.max(0, Math.min(positionMs, maxSeekMs))
            : target;
        seekTargetRef.current = null;
        seekIssuedAtRef.current = null;
        isSeekingRef.current = false;
        confirmedSeekRef.current = { positionMs: confirmedMs, confirmedAt: Date.now() };
        setWidth(confirmedMs);
        setTempWidth(confirmedMs);
        setIsSeeking(false);
    };

    return (
        <View>
            <Video
                key={sourceType === 'local' && localUri ? localUri : remoteUri} // force new native instance per track
                ref={playerRef}
                source={{ uri: sourceType === 'local' && localUri ? localUri : remoteUri }}
                audioOnly
                paused={!playing}
                playInBackground
                rate={rate}
                playWhenInactive
                ignoreSilentSwitch="ignore"
                progressUpdateInterval={250}
                onLoad={(meta) => {
                    const dMs = (meta?.duration ?? 0) * 1000;
                    const safe = Number.isFinite(dMs) ? dMs : 0;
                    const capped = limitMs ? Math.min(safe, limitMs) : safe;
                    console.log('[AudioPlayer] onLoad', {
                        index,
                        remotePath,
                        source: sourceType === 'local' ? 'LOCAL' : 'REMOTE',
                        uri: sourceType === 'local' && localUri ? localUri : remoteUri,
                        durationMs: safe,
                        cappedMs: capped,
                    });
                    setTotal(capped);
                    setIsLoaded(true);
                    setLoadingErr(null);
                }}
                onBuffer={(b) => {
                    const buffering = !!b?.isBuffering;
                    setIsBuffering(buffering);
                    if (buffering) {
                        console.log('[AudioPlayer] onBuffer start', {
                            index,
                            remotePath,
                            source: sourceType,
                        });
                    } else {
                        console.log('[AudioPlayer] onBuffer end', {
                            index,
                            remotePath,
                            source: sourceType,
                        });
                    }
                }}
                onSeek={(event) => {
                    const target = seekTargetRef.current;
                    if (typeof target !== 'number') return;
                    const requestedMs = Number(event?.seekTime) * 1000;
                    // Ignore acknowledgements for an older seek if the user
                    // scrubbed again before the previous native seek finished.
                    if (event?.seekTime != null && Number.isFinite(requestedMs)
                        && Math.abs(requestedMs - target) > 1000) return;
                    const actualMs = event?.currentTime == null
                        ? target : Number(event.currentTime) * 1000;
                    finishSeek(actualMs);
                }}
                onProgress={(p) => {
                    if (!isLoaded) return;

                    const ctMs = (p?.currentTime ?? 0) * 1000;
                    if (!Number.isFinite(ctMs)) return;
                    const v = Math.max(0, Math.min(ctMs, maxSeekMs));

                    if (isSeekingRef.current) {
                        const target = seekTargetRef.current;
                        // While the user drags, the native slider is the only
                        // source of thumb position (not onProgress).
                        if (typeof target !== 'number') return;
                        // Wait for onSeek. A queued pre-seek progress event could
                        // otherwise falsely confirm a small seek and snap back.
                        // Fallback only after native seek has had time to settle.
                        const elapsed = Date.now() - (seekIssuedAtRef.current ?? Date.now());
                        if (elapsed >= 1200 && Math.abs(v - target) <= Math.max(750, (elapsed + 350) * rate)) {
                            finishSeek(v);
                        }
                        return;
                    }

                    const confirmed = confirmedSeekRef.current;
                    if (confirmed) {
                        const ageMs = Date.now() - confirmed.confirmedAt;
                        // Queued pre-seek progress can arrive after onSeek.
                        // Never send the thumb back to that stale position.
                        if (ageMs < 1000 && Math.abs(v - confirmed.positionMs) > 400 + (ageMs + 250) * rate) {
                            return;
                        }
                        if (ageMs >= 1000) confirmedSeekRef.current = null;
                    }

                    if (limitMs && ctMs >= limitMs) {
                        setWidth(limitMs);
                        setTempWidth(limitMs);
                        setPlaying(false);
                        return;
                    }

                    setWidth(v);
                    setTempWidth(v);
                }}
                onEnd={() => {
                    setPlaying(false);
                }}
                onError={(e) => {
                    console.log('[AudioPlayer] onError', {
                        index,
                        remotePath,
                        source: sourceType === 'local' ? 'LOCAL' : 'REMOTE',
                        uri: sourceType === 'local' && localUri ? localUri : remoteUri,
                        error: e?.error ?? e,
                    });
                    setPlaying(false);
                    setIsLoaded(false);
                    setLoadingErr(e?.error ?? 'Audio load error');
                }}
            />

            <View style={[{ marginTop: 10, }, Platform.OS === 'web' && { paddingHorizontal: 15 }]}>


                <Slider
                    step={SLIDER_STEP_MS}
                    minimumValue={0}
                    maximumValue={maxSeekMs > 0 ? maxSeekMs : 1}
                    minimumTrackTintColor={themeColor0.bgColor(1)}
                    maximumTrackTintColor={colors.textSecondary}
                    thumbTintColor={themeColor0.bgColor(1)}
                    value={width}
                    disabled={!isLoaded || total <= 0}
                    onSlidingStart={() => {
                        if (!isLoaded) return;

                        // enter seeking mode; while dragging we don't accept progress updates
                        setIsSeeking(true);
                        isSeekingRef.current = true;
                        wasPlayingRef.current = playing;
                        if (playing) setPlaying(false);
                        seekTargetRef.current = null; // dragging, no target yet
                        seekIssuedAtRef.current = null;
                        confirmedSeekRef.current = null;
                        setTempWidth(width);
                    }}
                    onValueChange={(value) => {
                        if (!isLoaded) return;
                        const capped = limitMs ? Math.min(value, limitMs) : value;
                        const bounded = maxSeekMs > 0 ? Math.min(capped, maxSeekMs) : capped;
                        setTempWidth(bounded);
                    }}
                    onSlidingComplete={(value) => {
                        if (!isLoaded) return;

                        // stay seeking until onProgress reaches this target
                        setIsSeeking(true);
                        isSeekingRef.current = true;
                        const capped = limitMs ? Math.min(value, limitMs) : value;
                        const bounded = maxSeekMs > 0 ? Math.min(capped, maxSeekMs) : capped;
                        setTempWidth(bounded);
                        setWidth(bounded); // update once, only after release

                        seekTargetRef.current = bounded; // ms
                        seekIssuedAtRef.current = Date.now();
                        playerRef.current?.seek(bounded / 1000);
                        if (wasPlayingRef.current) setPlaying(true);
                    }}
                />

                <View style={[NewStyles.rowWrapper, { paddingHorizontal: 15 }]}>
                    {/* UX: left current, right total */}
                    <Text style={[NewStyles.text, { fontSize: 11, color: controlColor }]}>
                        {millisToMinutesAndSeconds(isSeeking ? tempWidth : width)}
                    </Text>
                    <Text style={[NewStyles.text, { fontSize: 11, color: controlColor }]}>
                        {millisToMinutesAndSeconds(total)}
                    </Text>
                </View>
            </View>

            <View style={[NewStyles.row, NewStyles.center, { gap: 10, flexDirection: 'row-reverse' }]}>
                {audio?.length > 1 && (
                    <TouchableOpacity
                        onPress={next}
                        style={{ padding: 5 }}
                        disabled={index === audio.length - 1}
                    >
                        <PlayForwardIcon
                            color={index === audio.length - 1 ? themeColor1.bgColor(0.7) : controlColor}
                        />
                    </TouchableOpacity>
                )}
                {!isLoaded && !loadingErr && <ActivityIndicator size={'large'} color={controlColor} />}
                {(!playing && !(!isLoaded && !loadingErr)) && (
                    <TouchableOpacity
                        onPress={() => {
                            // if (!checkIsRecording()) {
                            handlePlayPress()
                            // }
                        }}
                        disabled={!!loadingErr || !remoteUri || remoteUri.endsWith('/') || isDownloading}
                    >
                        {(isDownloading || isBuffering) ? (
                            <ActivityIndicator size={"large"} color={controlColor} />
                        ) : (
                            <Ionicons
                                name="play-circle"
                                size={40}
                                color={!!loadingErr ? themeColor1.bgColor(0.7) : controlColor}
                            />
                        )}
                    </TouchableOpacity>
                )}

                {(playing && !(!isLoaded && !loadingErr)) && (
                    <TouchableOpacity onPress={pauseSound}>
                        {isBuffering ? (
                            <ActivityIndicator size={"large"} color={controlColor} />
                        ) : (
                            <Ionicons name="pause-circle" size={40} color={controlColor} />
                        )}
                    </TouchableOpacity>
                )}

                {audio?.length > 1 && (
                    <TouchableOpacity style={{ padding: 5 }} onPress={prev} disabled={index === 0}>
                        <PlayBackIcon color={index > 0 ? controlColor : themeColor1.bgColor(0.7)} />
                    </TouchableOpacity>
                )}
            </View>
            <ScrollView horizontal style={[{ marginTop: 15, gap: 10 }]} contentContainerStyle={{ gap: 10, paddingHorizontal: 15 }} showsHorizontalScrollIndicator={false}>
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((item) => (
                    <TouchableOpacity
                        key={item}
                        onPress={() => setRate(item)}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            backgroundColor:
                                rate === item
                                    ? themeColor0.bgColor(1)
                                    : themeColor1.bgColor(0.2),
                        }}
                    >
                        <Text
                            style={{
                                color:
                                    rate === item
                                        ? '#fff'
                                        : controlColor,
                                fontSize: 14,
                            }}
                        >
                            {item}x
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}


