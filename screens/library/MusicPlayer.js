import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { dlUrl, uri } from '../../services/URL'
import { useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import makeStyles from '../../styles/NewStyles'
import { themeColor0, themeColor10, themeColor4 } from '../../theme/Color'
import Loader from '../../components/Loader'
import AudioPlayer from '../../components/AudioPlayer'
import { Ionicons } from '@expo/vector-icons'
import { CaptureProtection } from '../../helpers/CaptureProtection'
import { useTranslation } from 'react-i18next'
import * as FileSystem from 'expo-file-system'
import { useQuery } from '@tanstack/react-query'
import LibraryFileLoadError from '../../components/LibraryFileLoadError'

const MusicPlayer = ({ route, navigation }) => {

  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en'
  const NewStyles = useMemo(() => makeStyles(lang), [lang])

  const params = route?.params
  const file = params?.file

  const user = useSelector(state => state.user?.data)
  const userToken = useSelector(state => state.auth?.token)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [musicIndex, setMusicIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [playNow, setPlayNow] = useState(false)

  const [downloadingTrackId, setDownloadingTrackId] = useState(null)
  const [downloadedTracks, setDownloadedTracks] = useState({})
  const [preferLocalMap, setPreferLocalMap] = useState({})

  const [initialAudioReady, setInitialAudioReady] = useState(false)
  const [initialLocalUri, setInitialLocalUri] = useState(null)
  const [initialSourceType, setInitialSourceType] = useState('remote')

  const [cachedCovers, setCachedCovers] = useState({})

  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    CaptureProtection.prevent()
    return () => CaptureProtection.allow()
  }, [])

  const fetchFiles = async () => {

    const res = await axios.post(
      `${uri}/fetchFiles`,
      { id: file?.id },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    )

    if (!Array.isArray(res?.data?.file_audio) || !res.data.file_audio.some(item => item?.file_path)) {
      throw new Error('فایل صوتی این مورد روی سرور در دسترس نیست.');
    }

    return {
      audio: res?.data?.file_audio || [],
      galleries: res?.data?.galleries || []
    }
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['music-player-files', file?.id, userToken],
    queryFn: fetchFiles,
    enabled: !!userToken && !!file?.id,

    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24 * 30,

    networkMode: 'offlineFirst',
    retry: false,

    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const audio = useMemo(() => data?.audio || [], [data])
  const galleries = useMemo(() => data?.galleries || [], [data])

  const getLocalPaths = (item, index) => {

    const trackId = item?.id ?? item?.file_gallery_id ?? index
    const cacheDir = `${FileSystem.documentDirectory}audio-cache/`

    const fileName = item?.file_path
      ? item.file_path.split('/').pop()
      : `${trackId}.bin`

    const safeFileName = `${trackId}_${fileName}`

    const localPath = `${cacheDir}${safeFileName}`
    const localDonePath = `${localPath}.complete`

    return { trackId, localPath, localDonePath }
  }

  const refreshDownloadedTracks = async (list) => {

    if (!Array.isArray(list) || list.length === 0) return

    try {

      const next = {}

      await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}audio-cache/`,
        { intermediates: true }
      )

      for (let i = 0; i < list.length; i++) {

        const { trackId, localPath, localDonePath } = getLocalPaths(list[i], i)

        const info = await FileSystem.getInfoAsync(localPath)
        const done = await FileSystem.getInfoAsync(localDonePath)

        if (info.exists && done.exists) {
          next[trackId] = true
        }

      }

      setDownloadedTracks(next)

    } catch (e) { }

  }

  useEffect(() => {
    if (audio?.length) {
      refreshDownloadedTracks(audio)
    }
  }, [audio])

  const cacheCover = async (path) => {

    try {

      const fileName = path.split('/').pop()
      const cacheDir = `${FileSystem.documentDirectory}image-cache/`

      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true })

      const localPath = `${cacheDir}${fileName}`

      const info = await FileSystem.getInfoAsync(localPath)

      if (info.exists) return info.uri

      const result = await FileSystem.downloadAsync(`${dlUrl}/${path}`, localPath)

      return result.uri

    } catch (e) {

      return `${dlUrl}/${path}`

    }

  }

  useEffect(() => {

    if (!galleries?.length) return

    const loadImages = async () => {

      const map = {}

      for (let i = 0; i < galleries.length; i++) {

        const item = galleries[i]

        if (!item?.image_path) continue

        const uri = await cacheCover(item.image_path)

        map[item.image_path] = uri
      }

      setCachedCovers(map)

    }

    loadImages()

  }, [galleries])

  useEffect(() => {

    let active = true

    if (!audio?.length) return

    setInitialAudioReady(false)

    ;(async () => {

      try {

        const current = audio[musicIndex]

        if (!current) {
          if (active) {
            setInitialLocalUri(null)
            setInitialSourceType('remote')
            setInitialAudioReady(true)
          }
          return
        }

        const { trackId, localPath, localDonePath } = getLocalPaths(current, musicIndex)

        const info = await FileSystem.getInfoAsync(localPath)
        const done = await FileSystem.getInfoAsync(localDonePath)

        if (active && info.exists && done.exists) {

          setInitialLocalUri(info.uri)
          setInitialSourceType('local')

          setDownloadedTracks(prev => ({
            ...prev,
            [trackId]: true
          }))

        } else {

          setInitialLocalUri(null)
          setInitialSourceType('remote')

        }

      } finally {

        if (active) setInitialAudioReady(true)

      }

    })()

    return () => { active = false }

  }, [audio, musicIndex])

  useEffect(() => {

    if (galleries?.length < 2) return

    const interval = setInterval(() => {

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {

        const nextIndex = (currentIndex + 1) % galleries.length

        setCurrentIndex(nextIndex)

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start()

      })

    }, 15000)

    return () => clearInterval(interval)

  }, [currentIndex, galleries?.length])

  if (isLoading && !data) {
    return <Loader />
  }
  if (isError) {
    return <LibraryFileLoadError error={error} onRetry={refetch} />
  }

  const coverUri =
    cachedCovers[galleries[currentIndex]?.image_path] ??
    `${dlUrl}/${galleries[currentIndex]?.image_path}`

  return (

    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>

      <ImageBackground
        style={{ flex: 1, paddingTop: 65 }}
        source={{ uri: `${dlUrl}/${file?.image_gallery?.image_path}` }}
        imageStyle={{ opacity: 0.5, backgroundColor: themeColor4.bgColor(1) }}
        blurRadius={25}
      >

        <Animated.Image
          source={{ uri: coverUri }}
          style={{
            aspectRatio: 1,
            width: '80%',
            borderRadius: 17,
            alignSelf: 'center',
            marginTop: 10,
            opacity: fadeAnim
          }}
        />

        <Text style={[NewStyles.text10, { textAlign: 'center', marginVertical: 10 }]}>
          {audio?.[musicIndex]?.title}
        </Text>

        {
          audio && initialAudioReady
            ? (
              <AudioPlayer
                audio={audio}
                setIndex={setMusicIndex}
                index={musicIndex}
                playing={playing}
                setPlaying={setPlaying}
                playNow={playNow}
                preferLocalMap={preferLocalMap}
                downloadedTracks={downloadedTracks}
                initialLocalUri={initialLocalUri}
                initialSourceType={initialSourceType}
              />
            )
            : (
              <ActivityIndicator size="large" color={themeColor10.bgColor(1)} />
            )
        }

        <FlatList
          data={audio}
          keyExtractor={(item, index) => String(item?.id ?? index)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => {

            const { trackId, localPath, localDonePath } = getLocalPaths(item, index)

            const isDownloaded = !!downloadedTracks[trackId]
            const isDownloadingTrack = downloadingTrackId === trackId

            return (

              <TouchableOpacity
                onPress={() => {

                  setMusicIndex(index)

                  if (isDownloaded) {
                    setPreferLocalMap(prev => ({ ...prev, [trackId]: true }))
                  }

                  if (index === musicIndex) {
                    setPlaying(p => !p)
                  } else {
                    setPlaying(true)
                  }

                }}
                style={[
                  NewStyles.row,
                  {
                    width: '90%',
                    alignSelf: 'center',
                    paddingHorizontal: 10,
                    alignItems: 'center',
                    paddingBottom: 15,
                    marginTop: 20,
                    gap: 35
                  }
                ]}
              >

                <Text style={[NewStyles.text10, { flex: 1 }]}>
                  {item?.title}
                </Text>

                <View style={[NewStyles.rowWrapper, { gap: 35 }]}>

                  <TouchableOpacity
                    disabled={isDownloadingTrack}
                    onPress={async () => {

                      if (!item?.file_path) return

                      if (!isDownloaded) {

                        if (user?.is_offline_mode == 1) {

                          try {

                            setDownloadingTrackId(trackId)

                            await FileSystem.makeDirectoryAsync(
                              `${FileSystem.documentDirectory}audio-cache/`,
                              { intermediates: true }
                            )

                            const encoded = encodeURI(`${dlUrl}/${item.file_path}`)

                            await FileSystem.downloadAsync(encoded, localPath)

                            await FileSystem.writeAsStringAsync(localDonePath, 'ok')

                            setDownloadedTracks(prev => ({
                              ...prev,
                              [trackId]: true
                            }))

                          } finally {

                            setDownloadingTrackId(null)

                          }

                        } else {

                          navigation.navigate('Subscription')

                        }

                      }

                    }}
                  >

                    {
                      isDownloadingTrack
                        ? <ActivityIndicator size="small" color={themeColor10.bgColor(1)} />
                        : isDownloaded
                          ? <Ionicons name="checkmark-circle" color={themeColor10.bgColor(1)} size={20} />
                          : <Ionicons name="download-outline" color={themeColor10.bgColor(1)} size={20} />
                    }

                  </TouchableOpacity>

                  <Ionicons
                    name={(index == musicIndex && playing) ? 'pause' : 'play'}
                    color={themeColor10.bgColor(1)}
                    size={20}
                  />

                  <Text style={NewStyles.text10}>
                    {index + 1}
                  </Text>

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
