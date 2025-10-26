import { Image, ImageBackground, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import NewStyles, { deviceWidth } from '../../styles/NewStyles'
import { useNavigation } from '@react-navigation/native'
import { dlUrl } from '../../services/URL'
import { Ionicons } from '@expo/vector-icons';
import { themeColor4, themeColor6 } from '../../theme/Color'

const MyFileComponent = ({ item, onLongPress, showTrash = true }) => {
    const navigation = useNavigation()
    return (
        <Pressable style={[item?.is_album == 0 ? { width: deviceWidth * 0.45, aspectRatio: 0.73 } : { width: deviceWidth * 0.45, aspectRatio: 1 }, NewStyles.border8, NewStyles.shadow]} onLongPress={() => {
            if (onLongPress) {
                onLongPress()
            }
        }} onPress={() => {
            if (item?.file_type == 2 || item?.file_type == 5) {
                navigation.navigate('PDFReader', { id: item?.id })
            }
            if (item?.file_type == 1) {
                navigation.navigate('MusicPlayer', { file: item })
            }
            if (item?.file_type == 6) {
                navigation.navigate('VideoPlayer', { file: item })
            }
            if (item?.file_type == 3 || item?.file_type == 4) {
                navigation.navigate('PictureAudio', { id: item?.id })
            }
        }}>
            <ImageBackground source={{ uri: `${dlUrl}/${item?.image_gallery?.image_path}` }} style={[{ height: '100%', width: '100%', alignItems: 'flex-start' }, NewStyles.border8]} imageStyle={NewStyles.border8} >
                {showTrash && <TouchableOpacity style={[{ padding: 10, backgroundColor: themeColor4.bgColor(0.8), margin: 5, }, NewStyles.border100]} onPress={() => {
                    if (onLongPress) {
                        onLongPress()
                    }
                }}>
                    <Ionicons color={themeColor6.bgColor(1)} size={24} name='trash' />
                </TouchableOpacity>}
            </ImageBackground>
        </Pressable>
    )
}

export default MyFileComponent

const styles = StyleSheet.create({})