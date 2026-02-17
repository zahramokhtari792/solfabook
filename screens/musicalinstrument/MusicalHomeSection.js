import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import makeStyles from '../../styles/NewStyles'
import { imageUri, mainUri } from '../../services/URL'
import { themeColor4 } from '../../theme/Color'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

const MusicalHomeSection = ({ data, title }) => {
    const navigation = useNavigation()
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    return (
        <View style={{ width: '100%' }}>
            <View style={[NewStyles.rowWrapper, { marginBottom: 20, marginTop: 20 }, lang != 'en' ? { paddingRight: 10 } : { paddingLeft: 10 }]}>
                <Text style={[NewStyles.title10,]}>{title}</Text>
            </View>
            <Pressable style={[{ width: '100%', }, NewStyles.center, NewStyles.shadow]} onPress={() => {
                navigation.navigate('MusicalInstrumentIntro')
            }}>
                <Image source={{ uri: `${imageUri}/${data?.data?.[0]?.image_path}` }} style={[{ width: '95%', aspectRatio: 1.9, backgroundColor: themeColor4.bgColor(1) }, NewStyles.shadow, NewStyles.border10]} />
            </Pressable>
        </View>
    )
}

export default MusicalHomeSection

const styles = StyleSheet.create({})