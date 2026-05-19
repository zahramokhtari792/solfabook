import { ActivityIndicator, Alert, FlatList, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import makeStyles from '../../styles/NewStyles'
import Loader from '../../components/Loader'
import axios from 'axios'
import { dlUrl, uri } from '../../services/URL'
import { handleError } from '../../helpers/Common'
import { useFocusEffect } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import * as ScreenOrientation from 'expo-screen-orientation';
import { themeColor0, themeColor4 } from '../../theme/Color'
import Video from 'react-native-video'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CaptureProtection } from '../../helpers/CaptureProtection'
import { useTranslation } from 'react-i18next'
import * as FileSystem from 'expo-file-system'
import { Ionicons } from '@expo/vector-icons'
const VideoPlayer = ({ route, navigation }) => {

  useEffect(() => {
    CaptureProtection.prevent();
    return () => {
      CaptureProtection.allow();
    };
  }, []);

  const { t } = useTranslation()

  const params = route?.params;
  const file = params?.file;
  const user = useSelector(state => state.user?.data)
  const [data, setData] = useState([])
  const [loader, setLoader] = useState(true)
  const userToken = useSelector(state => state.auth?.token)
  const [videoIndex, setVideoIndex] = useState(0);
  const [downloadingVideoId, setDownloadingVideoId] = useState(null);
  const [downloadedVideos, setDownloadedVideos] = useState({});
  const [preferLocalMap, setPreferLocalMap] = useState({});
  const [localUri, setLocalUri] = useState(null);
  const [sourceType, setSourceType] = useState('remote');
  const [playerKey, setPlayerKey] = useState(0);
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const NewStyles = useMemo(() => makeStyles(lang), [lang]);
  const currentVideo = data?.[videoIndex];
  const videoUri = currentVideo?.file_path ? `${dlUrl}/${currentVideo.file_path}` : null;

  const getLocalPaths = (item, index) => {
    const trackId = item?.id ?? item?.file_gallery_id ?? index;
    const cacheDir = `${FileSystem.documentDirectory}video-cache/`;
    const fileName = item?.file_path ? item.file_path.split('/').pop() : `${trackId}.bin`;
    const safeFileName = `${trackId}_${fileName}`;
    const localPath = `${cacheDir}${safeFileName}`;
    const localDonePath = `${localPath}.complete`;
    return { trackId, localPath, localDonePath };
  };

  const currentPaths = getLocalPaths(currentVideo, videoIndex);
  const currentTrackId = currentPaths.trackId;
  const shouldUseLocal = !!localUri && (
    (preferLocalMap && preferLocalMap[currentTrackId] === true) ||
    (downloadedVideos && downloadedVideos[currentTrackId] === true)
  );

  const videoSource = useMemo(() => {
    if (!videoUri) return undefined;
    if (sourceType === 'local' && localUri) {
      return { uri: localUri };
    }
    return {
      uri: encodeURI(videoUri),
      headers: userToken ? { 'Authorization': `Bearer ${userToken}` } : undefined,
    };
  }, [videoUri, userToken, sourceType, localUri]);
  const fetchFiles = () => {
    axios.post(`${uri}/fetchFiles`, { id: file?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
      .then((res) => {
        setData(res?.data?.file_video)
      })
      .catch((err) => {
        handleError(err)
      })
      .finally(() => {
        setLoader(false)
      })
  }

  const readCompleteMeta = async (path) => {
    try {
      const txt = await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.UTF8 });
      const meta = JSON.parse(txt);
      return meta && typeof meta === 'object' ? meta : null;
    } catch (e) {
      return null;
    }
  };

  const writeCompleteMeta = async (path, meta) => {
    try {
      await FileSystem.writeAsStringAsync(path, JSON.stringify(meta), { encoding: FileSystem.EncodingType.UTF8 });
    } catch (e) {
      // ignore
    }
  };



  useFocusEffect(useCallback(() => {
    fetchFiles()
  }, []))

  useEffect(() => {
    if (!data?.length) return;
    if (videoIndex >= data.length) {
      setVideoIndex(0);
    }
  }, [data, videoIndex]);

  useEffect(() => {
    if (!currentVideo?.file_path) {
      setLocalUri(null);
      return;
    }
    let active = true;
    (async () => {
      try {
        const { localPath, localDonePath } = currentPaths;
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}video-cache/`, { intermediates: true });
        const info = await FileSystem.getInfoAsync(localPath);
        const done = await FileSystem.getInfoAsync(localDonePath);
        if (active && info.exists && done.exists) {
          const meta = await readCompleteMeta(localDonePath);
          if (meta && info.size && meta.contentLength && Number(meta.contentLength) > 0) {
            if (Number(info.size) !== Number(meta.contentLength)) {
              await invalidateLocalCache();
              return;
            }
          } else if (meta && info.size && meta.size && Number(info.size) !== Number(meta.size)) {
            await invalidateLocalCache();
            return;
          } else if (!meta && videoUri) {
            try {
              const headRes = await axios.head(encodeURI(videoUri), {
                headers: userToken ? { 'Authorization': `Bearer ${userToken}` } : undefined
              });
              const headHeaders = headRes?.headers ?? {};
              const headLength = Number(headHeaders['content-length'] || headHeaders['Content-Length'] || 0);
              if (headLength > 0 && Number(info.size) !== headLength) {
                await invalidateLocalCache();
                return;
              }
            } catch (e) {
              // ignore head errors
            }
          }
          setLocalUri(info.uri);
        } else if (active) {
          setLocalUri(null);
        }
      } catch (e) {
        if (active) setLocalUri(null);
      }
    })();
    return () => { active = false; };
  }, [currentVideo?.file_path, videoIndex, downloadedVideos]);

  useEffect(() => {
    if (shouldUseLocal) {
      setSourceType('local');
    } else {
      setSourceType('remote');
    }
  }, [shouldUseLocal]);

  useEffect(() => {
    if (!videoUri) return;
    setPlayerKey((k) => k + 1);
  }, [videoUri, sourceType]);

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;
    let active = true;
    (async () => {
      try {
        const next = {};
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}video-cache/`, { intermediates: true });
        for (let i = 0; i < data.length; i++) {
          const { trackId, localPath, localDonePath } = getLocalPaths(data[i], i);
          const info = await FileSystem.getInfoAsync(localPath);
          const done = await FileSystem.getInfoAsync(localDonePath);
          if (info.exists && done.exists) {
            next[trackId] = true;
          }
        }
        if (active) setDownloadedVideos(next);
      } catch (e) {
        // ignore
      }
    })();
    return () => { active = false; };
  }, [data]);

  const downloadVideo = async (item, index) => {
    const { trackId, localPath, localDonePath } = getLocalPaths(item, index);
    if (!item?.file_path) return;
    if (downloadingVideoId === trackId) return;

    try {
      setDownloadingVideoId(trackId);
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}video-cache/`, { intermediates: true });
      const info = await FileSystem.getInfoAsync(localPath);
      const done = await FileSystem.getInfoAsync(localDonePath);
      if (info.exists && done.exists) {
        const meta = await readCompleteMeta(localDonePath);
        if (meta && info.size && meta.contentLength && Number(meta.contentLength) > 0) {
          if (Number(info.size) !== Number(meta.contentLength)) {
            await FileSystem.deleteAsync(localPath, { idempotent: true });
            await FileSystem.deleteAsync(localDonePath, { idempotent: true });
          } else {
            setDownloadedVideos((prev) => ({ ...prev, [trackId]: true }));
            setDownloadingVideoId(null);
            Alert.alert(t('Download complete'), t('Play from local now?'), [
              { text: t('No'), style: 'cancel', onPress: () => setPreferLocalMap((prev) => ({ ...prev, [trackId]: false })) },
              { text: t('Yes'), onPress: () => { setPreferLocalMap((prev) => ({ ...prev, [trackId]: true })); setVideoIndex(index); } }
            ]);
            return;
          }
        } else if (meta && info.size && meta.size && Number(info.size) !== Number(meta.size)) {
          await FileSystem.deleteAsync(localPath, { idempotent: true });
          await FileSystem.deleteAsync(localDonePath, { idempotent: true });
        } else {
          setDownloadedVideos((prev) => ({ ...prev, [trackId]: true }));
          setDownloadingVideoId(null);
          Alert.alert(t('Download complete'), t('Play from local now?'), [
            { text: t('No'), style: 'cancel', onPress: () => setPreferLocalMap((prev) => ({ ...prev, [trackId]: false })) },
            { text: t('Yes'), onPress: () => { setPreferLocalMap((prev) => ({ ...prev, [trackId]: true })); setVideoIndex(index); } }
          ]);
          return;
        }
      }
      if (done.exists && !info.exists) {
        await FileSystem.deleteAsync(localDonePath, { idempotent: true });
      }

      const encoded = encodeURI(`${dlUrl}/${item.file_path}`);
      const downloadResult = await FileSystem.downloadAsync(encoded, localPath, {
        headers: userToken ? { 'Authorization': `Bearer ${userToken}` } : undefined
      });
      const downloadedUri = downloadResult?.uri;
      const status = downloadResult?.status ?? 0;
      const headers = downloadResult?.headers ?? {};
      const contentType = headers['content-type'] || headers['Content-Type'] || '';
      const contentLength = Number(headers['content-length'] || headers['Content-Length'] || 0);
      const localInfo = await FileSystem.getInfoAsync(localPath);
      const localSize = localInfo?.size ?? 0;

      let remoteLength = contentLength;
      let remoteType = contentType;
      if (!remoteLength || !remoteType) {
        try {
          const headRes = await axios.head(encoded, {
            headers: userToken ? { 'Authorization': `Bearer ${userToken}` } : undefined
          });
          const headHeaders = headRes?.headers ?? {};
          remoteLength = remoteLength || Number(headHeaders['content-length'] || headHeaders['Content-Length'] || 0);
          remoteType = remoteType || headHeaders['content-type'] || headHeaders['Content-Type'] || '';
        } catch (e) {
          // ignore head errors
        }
      }

      const sizeOk = remoteLength > 0 ? localSize === remoteLength : localSize > 0;
      const typeOk = remoteType ? String(remoteType).includes('video') : true;
      const statusOk = status >= 200 && status < 300;

      if (!statusOk || !sizeOk || !typeOk) {
        await FileSystem.deleteAsync(localPath, { idempotent: true });
        await FileSystem.deleteAsync(localDonePath, { idempotent: true });
        console.log('[VideoPlayer] Download invalid', { trackId, status, remoteType, remoteLength, localSize });
        Alert.alert('Download failed', 'File is not valid. Please try again.');
        return;
      }

      await writeCompleteMeta(localDonePath, {
        size: localSize,
        contentLength: remoteLength || null,
        contentType: remoteType || null,
      });
      setDownloadedVideos((prev) => ({ ...prev, [trackId]: true }));
      Alert.alert(t('Download complete'), t('Play from local now?'), [
        { text: t('No'), style: 'cancel', onPress: () => setPreferLocalMap((prev) => ({ ...prev, [trackId]: false })) },
        { text: t('Yes'), onPress: () => { setPreferLocalMap((prev) => ({ ...prev, [trackId]: true })); setVideoIndex(index); } }
      ]);
    } catch (e) {
      console.log('[VideoPlayer] Download error', e?.message ?? e);
    } finally {
      setDownloadingVideoId(null);
    }
  };

  const invalidateLocalCache = async () => {
    try {
      const { localPath, localDonePath } = currentPaths;
      await FileSystem.deleteAsync(localPath, { idempotent: true });
      await FileSystem.deleteAsync(localDonePath, { idempotent: true });
    } catch (e) {
      // ignore
    }
    setDownloadedVideos((prev) => ({ ...prev, [currentTrackId]: false }));
    setPreferLocalMap((prev) => ({ ...prev, [currentTrackId]: false }));
    setLocalUri(null);
    setSourceType('remote');
  };

  if (loader) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <ImageBackground style={[{ flex: 1, paddingTop: 65 }]} source={{ uri: `${dlUrl}/${file?.image_gallery?.image_path}` }} imageStyle={{ opacity: 0.5, backgroundColor: themeColor4.bgColor(1) }} blurRadius={25}>
        {
          videoSource ? (
            <View
              style={[
                {
                  width: '100%',
                  overflow: 'hidden',
                  backgroundColor: 'black',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                Platform.OS === 'web'
                  ? {
                    height: 300,
                    minHeight: 300,
                    flexShrink: 0,
                  }
                  : {
                    aspectRatio: 1,
                  },
              ]}
            >
              <Video
                key={`video_${playerKey}`}
                source={videoSource}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                }}
                resizeMode="contain"
                controls
                paused={false}
                onLoad={() => {
                  console.log('[VideoPlayer] onLoad', {
                    source: sourceType,
                    uri: sourceType === 'local' ? localUri : videoUri,
                  });
                }}
                onError={(e) => {
                  console.log('[VideoPlayer] onError', {
                    source: sourceType,
                    uri: sourceType === 'local' ? localUri : videoUri,
                    error: e?.error ?? e,
                  });

                  if (sourceType === 'local') {
                    invalidateLocalCache();
                  }
                }}
                onFullscreenPlayerWillPresent={() => {
                  if (Platform.OS !== 'web') {
                    ScreenOrientation.unlockAsync();
                  }
                }}
                onFullscreenPlayerDidDismiss={() => {
                  if (Platform.OS !== 'web') {
                    ScreenOrientation.lockAsync(
                      ScreenOrientation.OrientationLock.PORTRAIT_UP
                    );
                  }
                }}
              />
            </View>
          ) : (
            <View style={{ aspectRatio: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[NewStyles.text10, { textAlign: 'center' }]}>No video available</Text>
            </View>
          )
        }
        <Text style={[NewStyles.text10, { textAlign: 'center', marginVertical: 20 }]}>{data[videoIndex]?.title}</Text>
        <FlatList
          data={data}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => {
            return (
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: themeColor4.bgColor(1), width: '100%' }} />
            )
          }}
          renderItem={({ item, index }) => {
            const { trackId } = getLocalPaths(item, index);
            const isDownloaded = !!downloadedVideos[trackId];
            const isDownloadingTrack = downloadingVideoId === trackId;
            return (
              <TouchableOpacity style={[NewStyles.row, { width: '90%', alignSelf: 'center', paddingHorizontal: 10, alignItems: 'center', paddingBottom: 15, marginTop: 20, gap: 35 },]} onPress={() => {
                setVideoIndex(index);
                if (isDownloaded) {
                  setPreferLocalMap((prev) => ({ ...prev, [trackId]: true }));
                }
              }}>
                <Text style={[NewStyles.text10, { flex: 1, textAlign: 'left' }, index == videoIndex && { color: themeColor0.bgColor(1) }]}>{item?.title}</Text>
                <View style={[NewStyles.rowWrapper, { gap: 20 }]}>
                  <TouchableOpacity
                    disabled={isDownloadingTrack}
                    onPress={() => {
                      if (!isDownloaded) {
                        if (user?.is_offline_mode == 1) {

                          downloadVideo(item, index);
                        } else {
                          navigation.navigate('Subscription');
                        }
                      }
                    }}
                    style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {isDownloadingTrack ? (
                      <ActivityIndicator size="small" color={themeColor0.bgColor(1)} />
                    ) : isDownloaded ? (
                      <Ionicons name="checkmark-circle" size={20} color={themeColor0.bgColor(1)} />
                    ) : (
                      <Ionicons name="download-outline" size={20} color={themeColor0.bgColor(1)} />
                    )}
                  </TouchableOpacity>
                  <Text style={[NewStyles.text10, index == videoIndex && { color: themeColor0.bgColor(1) }]}>{index + 1}</Text>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      </ImageBackground>
    </SafeAreaView>
  )
}

export default VideoPlayer

const styles = StyleSheet.create({})
