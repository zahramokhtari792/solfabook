import { FlatList, ImageBackground, StyleSheet, Text, View } from 'react-native'
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
import { TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { usePreventScreenCapture } from 'expo-screen-capture'
import { useTranslation } from 'react-i18next'
const VideoPlayer = ({ route }) => {

  usePreventScreenCapture();
  const params = route?.params;
  const file = params?.file;
  const [data, setData] = useState([])
  const [loader, setLoader] = useState(true)
  const userToken = useSelector(state => state.auth?.token)
  const [videoIndex, setVideoIndex] = useState(0);
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const NewStyles = useMemo(() => makeStyles(lang), [lang]);
  const currentVideo = data?.[videoIndex];
  const videoUri = currentVideo?.file_path ? `${dlUrl}/${currentVideo.file_path}` : null;
  const videoSource = useMemo(() => {
    if (!videoUri) return undefined;
    return {
      uri: encodeURI(videoUri),
      headers: userToken ? { 'Authorization': `Bearer ${userToken}` } : undefined,
    };
  }, [videoUri, userToken]);
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



  useFocusEffect(useCallback(() => {
    fetchFiles()
  }, []))

  useEffect(() => {
    if (!data?.length) return;
    if (videoIndex >= data.length) {
      setVideoIndex(0);
    }
  }, [data, videoIndex]);

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
            <Video
              key={videoUri ?? 'video'}
              source={videoSource}
              style={{ aspectRatio: 1, width: '100%' }}
              resizeMode="contain"
              controls
              paused={false}
              onFullscreenPlayerWillPresent={() => {
                ScreenOrientation.unlockAsync();
              }}
              onFullscreenPlayerDidDismiss={() => {
                ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
              }}
            />
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
            return (
              <TouchableOpacity style={[NewStyles.row, { width: '90%', alignSelf: 'center', paddingHorizontal: 10, alignItems: 'center', paddingBottom: 15, marginTop: 20, gap: 35 },]} onPress={() => { setVideoIndex(index) }}>
                <Text style={[NewStyles.text10, { flex: 1, textAlign: 'left' }, index == videoIndex && { color: themeColor0.bgColor(1) }]}>{item?.title}</Text>
                <View style={[NewStyles.rowWrapper, { gap: 35 }]}>

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
