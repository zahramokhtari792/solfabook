import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NewStyles, { deviceWidth } from '../../styles/NewStyles'
import { useNavigation } from '@react-navigation/native'
import { dlUrl } from '../../services/URL'

const MyFileComponent = ({ item, onLongPress }) => {
    const navigation = useNavigation()
    return (
        <Pressable style={[item?.file?.is_album == 0 ? { width: deviceWidth * 0.45, aspectRatio: 0.73 } : { width: deviceWidth * 0.45, aspectRatio: 1 }, NewStyles.border8, NewStyles.shadow]} onLongPress={()=>{
            if(onLongPress){
                onLongPress()
            }
        }} onPress={() => {
            if (item?.file?.file_type == 2 || item?.file?.file_type == 5) {
                navigation.navigate('PDFReader', { id: item?.file?.id })
            }
            if (item?.file?.file_type == 1) {
                navigation.navigate('MusicPlayer', { file: item?.file })
            }
            if (item?.file?.file_type == 6) {
                navigation.navigate('VideoPlayer', { file: item?.file })
            }
            if (item?.file?.file_type == 3 || item?.file?.file_type == 4) {
                navigation.navigate('PictureAudio', { id: item?.file?.id })
            }
        }}>
            <Image source={{ uri: `${dlUrl}/${item?.file?.image_gallery?.image_path}` }} style={[{ height: '100%', width: '100%' }, NewStyles.border8]} />
        </Pressable>
    )
}

export default MyFileComponent

const styles = StyleSheet.create({})