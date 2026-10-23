import { useAppTheme } from '../../context/ThemeProvider';
import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import { useNewStyles, deviceWidth } from '../../styles/NewStyles';
import { Image } from 'expo-image'
import { imageUri } from '../../services/URL'
import makeStyles from './../../styles/NewStyles';
import { useNavigation } from '@react-navigation/native'
import { themeColor4 } from '../../theme/Color'
import { useTranslation } from 'react-i18next'

const AlbumCategoryItem = ({ item }) => {
    const navigation = useNavigation()
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();
    return (
        <Pressable style={[{ width: deviceWidth * 0.42, aspectRatio: 1, backgroundColor: colors.surface }, NewStyles.border10, NewStyles.shadow]} onPress={() => {
            if (item?.has_subcategory == 1) {
                navigation.push('AlbumTab', { parentId: item?.id })
            } else {
                navigation.push('AllAlbums', { categoryId: item?.id })

            }
        }}>
            <Image style={[{ width: '100%', height: '100%' }, NewStyles.border10]} source={item?.image_path ? { uri: `${imageUri}/${item?.image_path}` } : require('../../assets/images/solfabooklogo.png')} />
        </Pressable>
    )
}

export default AlbumCategoryItem

const styles = StyleSheet.create({})