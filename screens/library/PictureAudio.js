import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity
} from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { dlUrl, uri } from './../../services/URL'
import { useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import { useNewStyles } from '../../styles/NewStyles'
import AudioPlayer from '../../components/AudioPlayer'
import ModalPlayer from './ModalPlayer'
import AlbumIcon from '../../assets/svg/AlbumIcon'
import { themeColor0 } from '../../theme/Color'
import { CaptureProtection } from '../../helpers/CaptureProtection'
import { useTranslation } from 'react-i18next'
import * as FileSystem from 'expo-file-system'
import { useQuery } from '@tanstack/react-query'

const PictureAudio = ({ route }) => {

  const id = route?.params?.id

  const { i18n, t } = useTranslation()
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en'

  const NewStyles = useNewStyles(lang)

  const userToken = useSelector(state => state.auth?.token)

  const [musicIndex, setMusicIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(false)

  const [downloadedTracks, setDownloadedTracks] = useState({})
  const [preferLocalMap, setPreferLocalMap] = useState({})
  const [initialLocalUri, setInitialLocalUri] = useState(null)
  const [initialSourceType, setInitialSourceType] = useState('remote')
  const [initialReady, setInitialReady] = useState(false)

  const scanRef = useRef(false)

  /* ---------------- Screen protection ---------------- */

  useEffect(() => {

    CaptureProtection.prevent()

    return () => CaptureProtection.allow()

  }, [])

  /* ---------------- React Query ---------------- */

  const fetchFiles = async () => {

    const res = await axios.post(
      `${uri}/fetchFiles`,
      { id },
      { headers: { Authorization: `Bearer ${userToken}` } }
    )

    return {
      image: res?.data?.file_image ?? [],
      audio: res?.data?.file_audio ?? []
    }

  }

  const { data, isLoading } = useQuery({

    queryKey: ['picture-audio', id, userToken],
    queryFn: fetchFiles,

    enabled: !!id && !!userToken,

    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24 * 30,

    networkMode: 'offlineFirst',

    refetchOnMount: false,
    refetchOnWindowFocus: false

  })

  const imageData = useMemo(() => data?.image ?? [], [data])
  const audio = useMemo(() => data?.audio ?? [], [data])

  /* ---------------- Local file helpers ---------------- */

  const getPaths = (item, index) => {

    const trackId = item?.id ?? index

    const dir = `${FileSystem.documentDirectory}audio-cache/`

    const fileName = item?.file_path?.split('/').pop()

    const localPath = `${dir}${trackId}_${fileName}`
    const donePath = `${localPath}.complete`

    return { trackId, dir, localPath, donePath }

  }

  const isValid = async (localPath, donePath) => {

    const info = await FileSystem.getInfoAsync(localPath)
    const done = await FileSystem.getInfoAsync(donePath)

    return info.exists && done.exists

  }

  /* ---------------- Scan downloaded tracks ---------------- */

  useEffect(() => {

    if (!audio.length || scanRef.current) return

    scanRef.current = true

    const run = async () => {

      const map = {}

      for (let i = 0; i < audio.length; i++) {

        const { trackId, localPath, donePath } = getPaths(audio[i], i)

        const valid = await isValid(localPath, donePath)

        if (valid) map[trackId] = true

      }

      setDownloadedTracks(map)

    }

    run()

  }, [audio])

  /* ---------------- Initial source ---------------- */

  useEffect(() => {

    if (!audio.length) return

    let active = true

    setInitialReady(false)

    const run = async () => {

      const current = audio[musicIndex]

      if (!current) return

      const { trackId, localPath, donePath } = getPaths(current, musicIndex)

      if (downloadedTracks[trackId]) {

        const valid = await isValid(localPath, donePath)

        if (active && valid) {

          setInitialLocalUri(localPath)
          setInitialSourceType('local')
          setInitialReady(true)

          return

        }

      }

      if (active) {

        setInitialLocalUri(null)
        setInitialSourceType('remote')
        setInitialReady(true)

      }

    }

    run()

    return () => { active = false }

  }, [musicIndex, downloadedTracks])

  /* ---------------- Download ---------------- */

  const downloadTrack = async (item, index) => {

    const { trackId, dir, localPath, donePath } = getPaths(item, index)

    try {

      await FileSystem.makeDirectoryAsync(dir, { intermediates: true })

      await FileSystem.downloadAsync(
        encodeURI(`${dlUrl}/${item.file_path}`),
        localPath
      )

      await FileSystem.writeAsStringAsync(donePath, 'ok')

      setDownloadedTracks(prev => ({
        ...prev,
        [trackId]: true
      }))

      Alert.alert(t('Download complete'))

    } catch (e) {

      console.log('Download error', e?.message)

    }

  }

  if (isLoading && !data) {
    return <Loader />
  }

  /* ---------------- UI ---------------- */

  return (

    <SafeAreaView style={NewStyles.container}>

      {audio.length > 0 && (

        <View>

          <TouchableOpacity
            style={{
              padding: 5,
              marginHorizontal: 15,
              marginTop: 5,
              alignSelf: 'flex-end'
            }}
            onPress={() => setVisible(true)}
          >
            <AlbumIcon color={themeColor0.bgColor(1)} />
          </TouchableOpacity>

          <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 10 }]}>
            {audio[musicIndex]?.title}
          </Text>

          {initialReady ? (

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

      )}

      <View style={{ flex: 1 }}>

        <Image
          style={{ height: '100%', width: '100%', resizeMode: 'contain' }}
          source={{ uri: `${dlUrl}/${imageData?.[0]?.file_path}` }}
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
        downloadedTracks={downloadedTracks}
        onDownloadTrack={downloadTrack}
        onPreferLocal={(trackId) =>
          setPreferLocalMap(prev => ({ ...prev, [trackId]: true }))
        }
      />

    </SafeAreaView>

  )

}

export default PictureAudio
