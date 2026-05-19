import { ActivityIndicator, Alert, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios';
import { dlUrl, imageUri, mainUri, uri } from './../../services/URL';
import { useSelector } from 'react-redux';
import { handleError } from '../../helpers/Common';
import Loader from '../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import makeStyles from '../../styles/NewStyles';
import AudioPlayer from '../../components/AudioPlayer';
import ModalPlayer from './ModalPlayer';
import { TouchableOpacity } from 'react-native';
import AlbumIcon from '../../assets/svg/AlbumIcon';
import { themeColor0 } from '../../theme/Color';
import { CaptureProtection } from '../../helpers/CaptureProtection';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

const PictureAudio = ({ route }) => {
    const params = route?.params;
    const id = params?.id;
    const { i18n, t } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    const userToken = useSelector(state => state.auth?.token);
    const [data, setData] = useState()
    const [audio, setAudio] = useState([])
    const [loader, setLoader] = useState(true)
    const [lastPage, setLastPage] = useState(1);
    const [musicIndex, setMusicIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [visible, setVisible] = useState(false);
    const [playNow, setPlayNow] = useState(false);
    const [downloadingTrackId, setDownloadingTrackId] = useState(null);
    const [downloadedTracks, setDownloadedTracks] = useState({});
    const [preferLocalMap, setPreferLocalMap] = useState({});
    const [initialAudioReady, setInitialAudioReady] = useState(false);
    const [initialLocalUri, setInitialLocalUri] = useState(null);
    const [initialSourceType, setInitialSourceType] = useState('remote');
    useEffect(() => {
        CaptureProtection.prevent();
        return () => {
            CaptureProtection.allow();
        };
    }, []);

    const fetchFiles = () => {
        axios.post(`${uri}/fetchFiles`, { id: id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                setData(res?.data?.file_image)
                setAudio(res?.data?.file_audio)

            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
            })
    }

    useFocusEffect(useCallback(() => {
        fetchFiles()
    }, []))

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

    useEffect(() => {
        if (audio?.length) {
            refreshDownloadedTracks(audio);
        }
    }, [audio]);

    useEffect(() => {
        let active = true;
        if (!audio?.length) return;
        setInitialAudioReady(false);
        (async () => {
            try {
                const current = audio[musicIndex];
                if (!current) {
                    if (active) {
                        setInitialLocalUri(null);
                        setInitialSourceType('remote');
                        setInitialAudioReady(true);
                    }
                    return;
                }
                const { trackId, localPath, localDonePath } = getLocalPaths(current, musicIndex);
                const info = await FileSystem.getInfoAsync(localPath);
                const done = await FileSystem.getInfoAsync(localDonePath);
                if (active && info.exists && done.exists) {
                    setInitialLocalUri(info.uri);
                    setInitialSourceType('local');
                    setDownloadedTracks((prev) => ({ ...prev, [trackId]: true }));
                } else if (active) {
                    setInitialLocalUri(null);
                    setInitialSourceType('remote');
                }
            } catch (e) {
                if (active) {
                    setInitialLocalUri(null);
                    setInitialSourceType('remote');
                }
            } finally {
                if (active) setInitialAudioReady(true);
            }
        })();
        return () => { active = false; };
    }, [audio, musicIndex]);

    const downloadTrack = async (item, index) => {
        const { trackId, localPath, localDonePath } = getLocalPaths(item, index);
        if (!item?.file_path) return;
        if (downloadingTrackId === trackId) return;
        try {
            setDownloadingTrackId(trackId);
            await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}audio-cache/`, { intermediates: true });
            const info = await FileSystem.getInfoAsync(localPath);
            const done = await FileSystem.getInfoAsync(localDonePath);
            if (info.exists && done.exists) {
                setDownloadedTracks((prev) => ({ ...prev, [trackId]: true }));
                setDownloadingTrackId(null);
                Alert.alert(t('Download complete'), t('Play from local now?'), [
                    { text: t('No'), style: 'cancel', onPress: () => setPreferLocalMap((prev) => ({ ...prev, [trackId]: false })) },
                    { text: t('Yes'), onPress: () => { setPreferLocalMap((prev) => ({ ...prev, [trackId]: true })); setMusicIndex(index); setPlaying(true); } }
                ]);
                return;
            }
            if (done.exists && !info.exists) {
                await FileSystem.deleteAsync(localDonePath, { idempotent: true });
            }
            const encoded = encodeURI(`${dlUrl}/${item.file_path}`);
            const { uri: downloadedUri } = await FileSystem.downloadAsync(encoded, localPath);
            await FileSystem.writeAsStringAsync(localDonePath, 'ok', { encoding: FileSystem.EncodingType.UTF8 });
            setDownloadedTracks((prev) => ({ ...prev, [trackId]: true }));
            Alert.alert(t('Download complete'), t('Play from local now?'), [
                { text: t('No'), style: 'cancel', onPress: () => setPreferLocalMap((prev) => ({ ...prev, [trackId]: false })) },
                { text: t('Yes'), onPress: () => { setPreferLocalMap((prev) => ({ ...prev, [trackId]: true })); setMusicIndex(index); setPlaying(true); } }
            ]);
        } catch (e) {
            console.log('[PictureAudio] Download error', e?.message ?? e);
        } finally {
            setDownloadingTrackId(null);
        }
    };


    if (loader) {
        return (<Loader />)
    }
    return (
        <SafeAreaView style={NewStyles.container}>
            {
                audio?.length > 0 &&
                <View>
                    <TouchableOpacity style={{ padding: 5, marginHorizontal: 15, marginTop: 5, alignSelf: 'flex-end' }} onPress={() => {
                        setVisible(true)
                    }}>
                        <AlbumIcon color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                    <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 10, paddingHorizontal: 10 }]}>{audio?.[musicIndex]?.title}</Text>
                    {initialAudioReady ? (
                        <AudioPlayer
                            audio={audio}
                            playing={playing}
                            setPlaying={setPlaying}
                            index={musicIndex}
                            setIndex={setMusicIndex}
                            preferLocalMap={preferLocalMap}
                            downloadedTracks={downloadedTracks}
                            initialLocalUri={initialLocalUri}
                            initialSourceType={initialSourceType}
                        />
                    ) : (
                        <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
                    )}
                </View>
            }
            <View style={{ flex: 1 }}>
                <Image style={{ height: '100%', width: '100%', resizeMode: 'contain' }} source={{ uri: `${dlUrl}/${data?.[0]?.file_path}` }} />
            </View>
            <ModalPlayer
                visible={visible}
                setVisible={setVisible}
                audio={audio}
                musicIndex={musicIndex}
                setMusicIndex={setMusicIndex}
                playing={playing}
                setPlaying={setPlaying}
                downloadingTrackId={downloadingTrackId}
                downloadedTracks={downloadedTracks}
                onDownloadTrack={downloadTrack}
                onPreferLocal={(trackId) => setPreferLocalMap((prev) => ({ ...prev, [trackId]: true }))}
            />

        </SafeAreaView>
    )
}

export default PictureAudio

const styles = StyleSheet.create({})
