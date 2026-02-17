import { ActivityIndicator, Alert, Animated, FlatList, Image, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { dlUrl, uri } from '../../services/URL';
import { useSelector } from 'react-redux';
import { handleError } from '../../helpers/Common';
import { SafeAreaView } from 'react-native-safe-area-context';
import makeStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor4 } from '../../theme/Color';
import Loader from '../../components/Loader';
import AudioPlayer from '../../components/AudioPlayer';
import { Ionicons } from '@expo/vector-icons';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';

const MusicPlayer = ({ route }) => {
    usePreventScreenCapture();

    const params = route?.params;
    const file = params?.file
    const [galleries, setGallery] = useState([])
    const [audio, setAudio] = useState([])
    const [loader, setLoader] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [musicIndex, setMusicIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [playNow, setPlayNow] = useState(false);
    const [downloadingTrackId, setDownloadingTrackId] = useState(null);
    const [downloadedTracks, setDownloadedTracks] = useState({});
    const [preferLocalMap, setPreferLocalMap] = useState({});
    const userToken = useSelector(state => state.auth?.token);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    const fetchFiles = () => {
        axios.post(`${uri}/fetchFiles`, { id: file?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                setAudio(res?.data?.file_audio)
                setGallery(res?.data?.galleries)
                
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
            })
    }

    const getLocalPaths = (item, index) => {
        const trackId = item?.id ?? item?.file_gallery_id ?? index;
        const cacheDir = `${FileSystem.documentDirectory}audio-cache/`;
        const fileName = item?.file_path ? item.file_path.split('/').pop() : `${trackId}.bin`;
        const safeFileName = `${trackId}_${fileName}`;
        const localPath = `${cacheDir}${safeFileName}`;
        const localDonePath = `${localPath}.complete`;
        return { trackId, localPath, localDonePath };
    };

    const refreshDownloadedTracks = async (list) => {
        if (!Array.isArray(list) || list.length === 0) return;
        try {
            const next = {};
            await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}audio-cache/`, { intermediates: true });
            for (let i = 0; i < list.length; i++) {
                const { trackId, localPath, localDonePath } = getLocalPaths(list[i], i);
                const info = await FileSystem.getInfoAsync(localPath);
                const done = await FileSystem.getInfoAsync(localDonePath);
                if (info.exists && done.exists) {
                    next[trackId] = true;
                }
            }
            setDownloadedTracks(next);
        } catch (e) {
            // ignore
        }
    };

    useFocusEffect(useCallback(() => {
        fetchFiles()
    }, []))

    useEffect(() => {
        if (audio?.length) {
            refreshDownloadedTracks(audio);
        }
    }, [audio]);
    useEffect(() => {
        if (galleries?.length < 2) return;

        const interval = setInterval(() => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                // تغییر عکس
                const nextIndex = (currentIndex + 1) % galleries?.length;
                setCurrentIndex(nextIndex);

                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        }, 15000);

        return () => clearInterval(interval);
    }, [currentIndex, galleries?.length]);

    if (loader) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={[NewStyles.container]} edges={{ top: 'off', bottom: 'additive' }}>
            <ImageBackground style={{ flex: 1, paddingTop: 65 }} source={{ uri: `${dlUrl}/${file?.image_gallery?.image_path}` }} imageStyle={{ opacity: 0.5, backgroundColor: themeColor4.bgColor(1) }} blurRadius={25}>
                <Animated.Image
                    source={{ uri: `${dlUrl}/${galleries[currentIndex]?.image_path}` }}
                    style={[{ aspectRatio: 1, width: '80%', objectFit: 'contain', borderRadius: 17, alignSelf: 'center', marginTop: 10, opacity: fadeAnim }]}
                />
                <Text style={[NewStyles.text10, { textAlign: 'center', marginVertical: 10, paddingHorizontal: '5%' }]}>{audio?.[musicIndex]?.title}</Text>
                {
                    audio && <AudioPlayer audio={audio} setIndex={setMusicIndex} index={musicIndex} playing={playing} setPlaying={setPlaying} playNow={playNow} preferLocalMap={preferLocalMap} downloadedTracks={downloadedTracks} />
                }

                <FlatList
                    data={audio}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => {
                        return (
                            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: themeColor4.bgColor(1), width: '100%' }} />
                        )
                    }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item, index }) => {
                        const { trackId, localPath, localDonePath } = getLocalPaths(item, index);
                        const isDownloaded = !!downloadedTracks[trackId];
                        const isDownloadingTrack = downloadingTrackId === trackId;
                        return (
                            <TouchableOpacity onPress={() => {
                                setMusicIndex(index);
                                if (isDownloaded) {
                                    setPreferLocalMap((prev) => ({ ...prev, [trackId]: true }));
                                }
                                if (index == musicIndex) {
                                    setPlaying((p) => !p);
                                } else {
                                    setPlaying(true);
                                }
                            }} style={[NewStyles.row, { width: '90%', alignSelf: 'center', paddingHorizontal: 10, alignItems: 'center', paddingBottom: 15, marginTop: 20, gap: 35 }]}>
                                <Text style={[NewStyles.text10, { flex: 1, textAlign: 'left' }]}>{item?.title}</Text>
                                <View style={[NewStyles.rowWrapper, { gap: 35, width: '25%' }]}>
                                    <TouchableOpacity
                                        disabled={isDownloadingTrack}
                                        onPress={async () => {
                                            if (!item?.file_path) return;
                                            if (isDownloaded) {
                                                Alert.alert(
                                                    'Download complete',
                                                    'Play from local now?',
                                                    [
                                                        {
                                                            text: 'No',
                                                            style: 'cancel',
                                                            onPress: () => setPreferLocalMap((prev) => ({ ...prev, [trackId]: false }))
                                                        },
                                                        {
                                                            text: 'Yes',
                                                            onPress: () => {
                                                                setPreferLocalMap((prev) => ({ ...prev, [trackId]: true }));
                                                                setMusicIndex(index);
                                                                setPlaying(true);
                                                            }
                                                        }
                                                    ]
                                                );
                                                return;
                                            }
                                            try {
                                                setDownloadingTrackId(trackId);
                                                await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}audio-cache/`, { intermediates: true });
                                                const info = await FileSystem.getInfoAsync(localPath);
                                                const done = await FileSystem.getInfoAsync(localDonePath);
                                                if (info.exists && done.exists) {
                                                    setDownloadedTracks((prev) => ({ ...prev, [trackId]: true }));
                                                    setDownloadingTrackId(null);
                                                    Alert.alert('Download complete', 'Play from local now?', [
                                                        { text: 'No', style: 'cancel', onPress: () => setPreferLocalMap((prev) => ({ ...prev, [trackId]: false })) },
                                                        { text: 'Yes', onPress: () => { setPreferLocalMap((prev) => ({ ...prev, [trackId]: true })); setMusicIndex(index); setPlaying(true); } }
                                                    ]);
                                                    return;
                                                }
                                                const encoded = encodeURI(`${dlUrl}/${item.file_path}`);
                                                const { uri: downloadedUri } = await FileSystem.downloadAsync(encoded, localPath);
                                                await FileSystem.writeAsStringAsync(localDonePath, 'ok', { encoding: FileSystem.EncodingType.UTF8 });
                                                setDownloadedTracks((prev) => ({ ...prev, [trackId]: true }));
                                                console.log('[MusicPlayer] Download complete', { trackId, downloadedUri });
                                                Alert.alert('Download complete', 'Play from local now?', [
                                                    { text: 'No', style: 'cancel', onPress: () => setPreferLocalMap((prev) => ({ ...prev, [trackId]: false })) },
                                                    { text: 'Yes', onPress: () => { setPreferLocalMap((prev) => ({ ...prev, [trackId]: true })); setMusicIndex(index); setPlaying(true); } }
                                                ]);
                                            } catch (e) {
                                                console.log('[MusicPlayer] Download error', e?.message ?? e);
                                            } finally {
                                                setDownloadingTrackId(null);
                                            }
                                        }}
                                        style={[{ width: 20, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }]}
                                    >
                                        {isDownloadingTrack ? (
                                            <ActivityIndicator size="small" color={themeColor10.bgColor(1)} />
                                        ) : isDownloaded ? (
                                            <Ionicons name="checkmark-circle" color={themeColor10.bgColor(1)} size={20} />
                                        ) : (
                                            <Ionicons name="download-outline" color={themeColor10.bgColor(1)} size={20} />
                                        )}
                                    </TouchableOpacity>
                                    <View style={{ width: 20, aspectRatio: 1 }}>
                                        <Ionicons name={(index == musicIndex && playing) ? 'pause' : 'play'} color={themeColor10.bgColor(1)} size={20} />
                                    </View>
                                    <Text style={[NewStyles.text10, { minWidth: 30, textAlign: 'left' }]}>{index + 1}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                />
            </ImageBackground>
        </SafeAreaView>
    )
}

export default MusicPlayer

const styles = StyleSheet.create({})
