import { useAppTheme } from '../../context/ThemeProvider';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import { useNewStyles, langIsRTL } from '../../styles/NewStyles';
import { mainUri } from '../../services/URL'
import { themeColor4 } from '../../theme/Color'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

const DictionaryHome = ({ data, title }) => {
    const navigation = useNavigation()
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();
    return (
        <View style={{ width: '100%' }}>
            <View style={[NewStyles.rowWrapper, { marginBottom: 20, marginTop: 20 }, langIsRTL(lang) ? { paddingRight: 10 } : { paddingLeft: 10 }]}>
                <Text style={[NewStyles.title10,]}>{title}</Text>
            </View>
            <Pressable style={[{ width: '100%', }, NewStyles.center, NewStyles.shadow]} onPress={() => {
                navigation.navigate('Dictionary')
            }}>
                <Image source={{ uri: `${mainUri}/${data}` }} style={[{ width: '95%', aspectRatio: 1.9, backgroundColor: colors.surface }, NewStyles.shadow, NewStyles.border10]} />
            </Pressable>
        </View>
    )
}

export default DictionaryHome

const styles = StyleSheet.create({})