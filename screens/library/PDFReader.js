import { ActivityIndicator, Alert, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios';
import { dlUrl, uri } from './../../services/URL';
import { useSelector } from 'react-redux';
import { handleError } from '../../helpers/Common';
import Loader from '../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import makeStyles from '../../styles/NewStyles';
import PDFReaderWebView from './PDFReaderWebView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioPlayer from '../../components/AudioPlayer';
import * as ScreenOrientation from 'expo-screen-orientation';
import { CaptureProtection } from '../../helpers/CaptureProtection';
import AlbumIcon from '../../assets/svg/AlbumIcon';
import { themeColor0 } from '../../theme/Color';
import ModalPlayer from './ModalPlayer';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';

const PDFReader = ({ route }) => {
    if (Platform.OS === 'web') {
        const PDFReaderWeb = require('./PDFReaderWebView.web').default;
        return <PDFReaderWeb route={route} />;
    }

    const { t } = useTranslation()
    const params = route?.params;
    const id = params?.id;
    const userToken = useSelector(state => state.auth?.token);
    const [data, setData] = useState()
    const [audio, setAudio] = useState([])
    const [loader, setLoader] = useState(true)
    const [lastPage, setLastPage] = useState(1);
    const [musicIndex, setMusicIndex] = useState(0);
    const [visible, setVisible] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [downloadingTrackId, setDownloadingTrackId] = useState(null);
    const [downloadedTracks, setDownloadedTracks] = useState({});
    const [preferLocalMap, setPreferLocalMap] = useState({});
    const [initialAudioReady, setInitialAudioReady] = useState(false);
    const [initialLocalUri, setInitialLocalUri] = useState(null);
    const [initialSourceType, setInitialSourceType] = useState('remote');
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [downloadedPdf, setDownloadedPdf] = useState(false);
    const [preferLocalPdf, setPreferLocalPdf] = useState(false);
    const [localPdfUri, setLocalPdfUri] = useState(null);
    useEffect(() => {
        CaptureProtection.prevent();
        return () => {
            CaptureProtection.allow();
        };
    }, []);

    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);


    const fetchFiles = () => {
        axios.post(`${uri}/fetchFiles`, { id: id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                setData(res?.data?.file_pdf)
                console.log(res?.data?.file_pdf);

                setAudio(res?.data?.file_audio)
            })
            .catch((err) => {
                // handleError(errr)
                // Offline fallback: try to locate a previously downloaded PDF by id
                findLocalPdfById();
            })
            .finally(() => {
                setLoader(false)
            })
    }

    const findLocalPdfById = async () => {
        try {
            const cacheDir = `${FileSystem.documentDirectory}pdf-cache/`;
            const files = await FileSystem.readDirectoryAsync(cacheDir);
            const prefix = `${id}_`;
            const candidate = files.find((f) => f.startsWith(prefix) && !f.endsWith('.complete'));
            if (!candidate) return;
            const localPath = `${cacheDir}${candidate}`;
            const localDonePath = `${localPath}.complete`;
            const info = await FileSystem.getInfoAsync(localPath);
            const done = await FileSystem.getInfoAsync(localDonePath);
            if (info.exists && done.exists) {
                setDownloadedPdf(true);
                setLocalPdfUri(info.uri);
                setPreferLocalPdf(true);
            }
        } catch (e) {
            // ignore
        }
    };

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

    const getPdfPaths = () => {
        const filePath = data?.[0]?.file_path;
        const fileName = filePath ? filePath.split('/').pop() : `${id}.pdf`;
        const safeFileName = `${id}_${fileName}`;
        const cacheDir = `${FileSystem.documentDirectory}pdf-cache/`;
        const localPath = `${cacheDir}${safeFileName}`;
        const localDonePath = `${localPath}.complete`;
        return { filePath, cacheDir, localPath, localDonePath };
    };

    useFocusEffect(useCallback(() => {
        checkCookie()
        fetchFiles()
    }, []))

    const checkCookie = async () => {
        const lastPage = await AsyncStorage.getItem('lastPage');
        const file_id = await AsyncStorage.getItem('file_id');
        if (file_id == id) {
            setLastPage(parseInt(lastPage))
        }
    }

    const setCoockie = async (page) => {
        await AsyncStorage.setItem('lastPage', page);
        await AsyncStorage.setItem('file_id', id?.toString());
    }


    useEffect(() => {
        if (Platform.OS === 'web') {
            return undefined;
        }

        // وقتی صفحه باز شد → اجازه چرخش بده
        ScreenOrientation.unlockAsync().catch(() => undefined);

        return () => {
            if (Platform.OS !== 'web') {
                // وقتی صفحه بسته شد → دوباره قفل کن (مثلاً فقط portrait)
                ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => undefined);
            }
        };
    }, []);

    useEffect(() => {
        let active = true;
        if (!data?.[0]?.file_path) return;
        (async () => {
            try {
                const { cacheDir, localPath, localDonePath } = getPdfPaths();
                await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
                const info = await FileSystem.getInfoAsync(localPath);
                const done = await FileSystem.getInfoAsync(localDonePath);
                if (active && info.exists && done.exists) {
                    setDownloadedPdf(true);
                    setLocalPdfUri(info.uri);
                } else if (active) {
                    setDownloadedPdf(false);
                    setLocalPdfUri(null);
                }
            } catch (e) {
                if (active) {
                    setDownloadedPdf(false);
                    setLocalPdfUri(null);
                }
            }
        })();
        return () => { active = false; };
    }, [data]);

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
            console.log('[PDFReader] Audio download error', e?.message ?? e);
        } finally {
            setDownloadingTrackId(null);
        }
    };

    const downloadPdf = async () => {
        if (downloadingPdf) return;
        const { filePath, cacheDir, localPath, localDonePath } = getPdfPaths();
        if (!filePath) return;
        try {
            setDownloadingPdf(true);
            await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
            const info = await FileSystem.getInfoAsync(localPath);
            const done = await FileSystem.getInfoAsync(localDonePath);
            if (info.exists && done.exists) {
                setDownloadedPdf(true);
                setLocalPdfUri(info.uri);
                Alert.alert(t('Download complete'), t('Use local PDF now?'), [
                    { text: t('No'), style: 'cancel', onPress: () => setPreferLocalPdf(false) },
                    { text: t('Yes'), onPress: () => setPreferLocalPdf(true) }
                ]);
                return;
            }
            if (done.exists && !info.exists) {
                await FileSystem.deleteAsync(localDonePath, { idempotent: true });
            }
            const encoded = encodeURI(`${dlUrl}/${filePath}`);
            const result = await FileSystem.downloadAsync(encoded, localPath);
            if (result.status < 200 || result.status >= 300) {
                throw new Error('Download failed');
            }
            await FileSystem.writeAsStringAsync(localDonePath, 'ok', { encoding: FileSystem.EncodingType.UTF8 });
            setDownloadedPdf(true);
            setLocalPdfUri(result.uri);
            Alert.alert(t('Download complete'), t('Use local PDF now?'), [
                { text: t('No'), style: 'cancel', onPress: () => setPreferLocalPdf(false) },
                { text: t('Yes'), onPress: () => setPreferLocalPdf(true) }
            ]);
        } catch (e) {
        } finally {
            setDownloadingPdf(false);
        }
    };

    if (loader) {
        return (<Loader />)
    }
    return (
        <SafeAreaView style={NewStyles.container}>
            {
                audio?.length > 0 &&
                <View style={{}}>
                    <TouchableOpacity style={{ padding: 5, marginHorizontal: 15, marginTop: 5, alignSelf: 'flex-end' }} onPress={() => {
                        setVisible(true)
                    }}>
                        <AlbumIcon color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                    <Text style={[NewStyles.text10, { textAlign: 'center', marginVertical: 10, paddingHorizontal: '5%' }]}>{audio?.[musicIndex]?.title}</Text>

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
                <PDFReaderWebView
                    downloadedPdf={downloadedPdf}
                    downloadPdf={downloadPdf}
                    downloadingPdf={downloadingPdf}
                    route={{
                        params: {
                            pdfUrl: `${dlUrl}/${data?.[0]?.file_path}`,
                            id: id,
                            localUri: localPdfUri,
                            preferLocal: preferLocalPdf,
                        }
                    }}
                />
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

export default PDFReader

const styles = StyleSheet.create({})
