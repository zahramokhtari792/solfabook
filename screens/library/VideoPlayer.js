import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import makeStyles from '../../styles/NewStyles'
import Loader from '../../components/Loader'
import { dlUrl, uri } from '../../services/URL'
import { useSelector } from 'react-redux'
import * as ScreenOrientation from 'expo-screen-orientation'
import { themeColor0, themeColor4 } from '../../theme/Color'
import Video from 'react-native-video'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CaptureProtection } from '../../helpers/CaptureProtection'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import * as FileSystem from 'expo-file-system'

const VideoPlayer = ({ route, navigation }) => {

  const { t, i18n } = useTranslation()
  const file = route?.params?.file

  const user = useSelector(s => s.user?.data)
  const token = useSelector(s => s.auth?.token)

  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en'
  const NewStyles = useMemo(() => makeStyles(lang), [lang])

  const [videoIndex, setVideoIndex] = useState(0)
  const [downloading, setDownloading] = useState(null)

  const [downloadedMap, setDownloadedMap] = useState({})
  const [localUri, setLocalUri] = useState(null)
  const [sourceType, setSourceType] = useState('remote')

  const scanRef = useRef(false)

  /* ---------------- Helpers ---------------- */

  const getPaths = (item, index) => {

    const id = item?.id ?? index
    const dir = `${FileSystem.documentDirectory}video-cache/`

    const fileName = item?.file_path?.split('/').pop()

    const localPath = `${dir}${id}_${fileName}`
    const metaPath = `${localPath}.json`

    return { id, dir, localPath, metaPath }

  }

  const ensureDir = async (dir) => {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
  }

  const isValid = async (localPath) => {

    const info = await FileSystem.getInfoAsync(localPath)

    return info.exists && info.size > 0

  }

  const deleteCache = async (localPath, metaPath) => {

    await FileSystem.deleteAsync(localPath, { idempotent: true })
    await FileSystem.deleteAsync(metaPath, { idempotent: true })

  }

  /* ---------------- React Query ---------------- */

  const fetchFiles = async () => {

    const res = await axios.post(
      `${uri}/fetchFiles`,
      { id: file?.id },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    return res?.data?.file_video || []

  }

  const { data, isLoading } = useQuery({

    queryKey: ['video-player', file?.id, token],
    queryFn: fetchFiles,

    enabled: !!file?.id && !!token,

    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24 * 30,

    networkMode: 'offlineFirst',

    refetchOnMount: false,
    refetchOnWindowFocus: false

  })

  const videos = useMemo(() => data || [], [data])

  /* ---------------- Scan downloaded videos ---------------- */

  useEffect(() => {

    if (!videos.length || scanRef.current) return

    scanRef.current = true

    const run = async () => {

      const map = {}

      for (let i = 0; i < videos.length; i++) {

        const { id, localPath } = getPaths(videos[i], i)

        const valid = await isValid(localPath)

        if (valid) map[id] = true

      }

      setDownloadedMap(map)

    }

    run()

  }, [videos])

  /* ---------------- Current video source ---------------- */

  const currentVideo = videos[videoIndex]

  useEffect(() => {

    if (!currentVideo?.file_path) return

    const run = async () => {

      const { id, localPath } = getPaths(currentVideo, videoIndex)

      if (downloadedMap[id]) {

        const valid = await isValid(localPath)

        if (valid) {

          setLocalUri(localPath)
          setSourceType('local')

          return

        } else {

          await deleteCache(localPath)

        }

      }

      setLocalUri(null)
      setSourceType('remote')

    }

    run()

  }, [videoIndex, downloadedMap])

  const remoteUri = currentVideo?.file_path
    ? `${dlUrl}/${currentVideo.file_path}`
    : null

  const videoSource = useMemo(() => {

    if (!remoteUri) return undefined

    if (sourceType === 'local' && localUri) {

      return { uri: localUri }

    }

    return {

      uri: encodeURI(remoteUri),
      headers: { Authorization: `Bearer ${token}` }

    }

  }, [localUri, remoteUri, sourceType])

  /* ---------------- Download ---------------- */

  const downloadHandler = async (item, index) => {

    const { id, dir, localPath } = getPaths(item, index)

    try {

      setDownloading(id)

      await ensureDir(dir)

      await FileSystem.downloadAsync(
        `${dlUrl}/${item.file_path}`,
        localPath,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setDownloadedMap(p => ({ ...p, [id]: true }))

      Alert.alert(t('Download complete'))

    } catch {

      Alert.alert('Error', 'Download failed')

    } finally {

      setDownloading(null)

    }

  }

  if (isLoading && !data) {
    return <Loader />
  }

  /* ---------------- UI ---------------- */

  return (

    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>

      <ImageBackground
        style={{ flex: 1, paddingTop: 65 }}
        source={{ uri: `${dlUrl}/${file?.image_gallery?.image_path}` }}
        blurRadius={25}
        imageStyle={{
          opacity: 0.5,
          backgroundColor: themeColor4.bgColor(1)
        }}
      >

        {videoSource && (
          <View style={{
            width: '100%',
            backgroundColor: 'black',
            ...(Platform.OS === 'web'
              ? { height: 300 }
              : { aspectRatio: 1 })
          }}>
            <Video
              key={`${videoIndex}_${sourceType}`}
              source={videoSource}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
              controls
            />
          </View>
        )}

        <Text style={[NewStyles.text10, { textAlign: 'center', marginVertical: 20 }]}>
          {currentVideo?.title}
        </Text>

        <FlatList
          data={videos}
          keyExtractor={(item, i) => String(item?.id ?? i)}
          renderItem={({ item, index }) => {

            const { id } = getPaths(item, index)

            const isDownloaded = !!downloadedMap[id]

            return (

              <TouchableOpacity
                onPress={() => setVideoIndex(index)}
                style={[
                  NewStyles.row,
                  { width: '90%', alignSelf: 'center', paddingVertical: 15, gap: 25 }
                ]}
              >

                <Text style={[NewStyles.text10, { flex: 1 }]}>
                  {item?.title}
                </Text>

                <TouchableOpacity
                  disabled={downloading === id}
                  onPress={() => {

                    if (!isDownloaded) {

                      if (user?.is_offline_mode == 1) {
                        downloadHandler(item, index)
                      } else {
                        navigation.navigate('Subscription')
                      }

                    }

                  }}
                >

                  {downloading === id ? (

                    <ActivityIndicator size="small" color={themeColor0.bgColor(1)} />

                  ) : isDownloaded ? (

                    <Ionicons name="checkmark-circle" size={22} color={themeColor0.bgColor(1)} />

                  ) : (

                    <Ionicons name="download-outline" size={22} color={themeColor0.bgColor(1)} />

                  )}

                </TouchableOpacity>

                <Text style={[
                  NewStyles.text10,
                  index === videoIndex && { color: themeColor0.bgColor(1) }
                ]}>
                  {index + 1}
                </Text>

              </TouchableOpacity>

            )

          }}
        />

      </ImageBackground>

    </SafeAreaView>

  )

}

export default VideoPlayer
