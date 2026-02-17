import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import makeStyles from '../../styles/NewStyles'
import { Image } from 'react-native'
import { imageUri } from '../../services/URL'
import AudioPlayer from '../../components/AudioPlayer'
import { useTranslation } from 'react-i18next'

const InstrumentDetail = ({ route }) => {
    const parmas = route?.params;
    const data = parmas?.data;
    const [index, setIndex] = useState(0)
    const [playing, setPlaying] = useState(false)
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: `${imageUri}/${data?.image_path}` }} style={{ width: '100%', aspectRatio: 1.5, resizeMode: 'contain' }} />
                <View style={{ padding: '5%' }}>
                    <AudioPlayer audio={[{ 'file_path': data?.file_path }]} index={index} setIndex={setIndex} playing={playing} setPlaying={setPlaying} />
                    <Text style={NewStyles.title}>{data?.title}</Text>
                    <Text style={[NewStyles.text10, { marginVertical: 10, lineHeight: 24 }]}>{data?.description}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default InstrumentDetail

const styles = StyleSheet.create({})