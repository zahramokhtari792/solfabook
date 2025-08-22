import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { deviceWidth } from '../../styles/NewStyles'
import { Image } from 'expo-image'
import { imageUri } from '../../services/URL'
import NewStyles from './../../styles/NewStyles';
import { useNavigation } from '@react-navigation/native'
import { themeColor4 } from '../../theme/Color'

const AlbumCategoryItem = ({ item }) => {
    const navigation = useNavigation()
    return (
        <Pressable style={[{ width: deviceWidth * 0.42, aspectRatio: 1, backgroundColor: themeColor4.bgColor(1) }, NewStyles.border10, NewStyles.shadow]} onPress={() => {
            if (item?.has_subcategory == 1) {
                navigation.push('AlbumTab', { parentId: item?.id })
            }else{
                navigation.push('AllAlbums', { categoryId: item?.id })

            }
        }}>
            <Image style={[{ width: '100%', height: '100%' }, NewStyles.border10]} source={item?.image_path ? { uri: `${imageUri}/${item?.image_path}` } : require('../../assets/images/solfabooklogo.png')} />
        </Pressable>
    )
}

export default AlbumCategoryItem

const styles = StyleSheet.create({})