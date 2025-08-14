import { FlatList, ImageBackground,  StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import NewStyles from '../../styles/NewStyles'
import Loader from '../../components/Loader'
import axios from 'axios'
import { dlUrl, uri } from '../../services/URL'
import { handleError } from '../../helpers/Common'
import { useFocusEffect } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import * as ScreenOrientation from 'expo-screen-orientation';
import { themeColor0, themeColor4 } from '../../theme/Color'
import { useVideoPlayer, VideoView } from 'expo-video'
import { TouchableOpacity } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
const VideoPlayer = ({ route }) => {
  const params = route?.params;
  const file = params?.file;
  const [data, setData] = useState([])
  const [loader, setLoader] = useState(true)
  const userToken = useSelector(state => state.auth?.token)
  const [videoIndex, setVideoIndex] = useState(0);

  const player = useVideoPlayer(`${dlUrl}/${data[videoIndex]?.file_path}`);
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

  if (loader) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={NewStyles.container} edges={{top: 'off', bottom: 'additive'}}>
      <ImageBackground style={[{flex:1, paddingTop: 65 }]} source={{ uri: `${dlUrl}/${file?.image_gallery?.image_path}` }} imageStyle={{ opacity: 0.5, backgroundColor: themeColor4.bgColor(1) }} blurRadius={25}>
        <VideoView onFullscreenEnter={() => {
          ScreenOrientation.unlockAsync();
        }}
          onFullscreenExit={() => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          }} style={{ aspectRatio: 1, width: '100%' }} player={player} contentFit='contain' allowsFullscreen allowsPictureInPicture />
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