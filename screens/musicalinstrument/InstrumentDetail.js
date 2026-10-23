import { ScrollView, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNewStyles } from '../../styles/NewStyles';
import { useAppTheme } from '../../context/ThemeProvider';
import InstrumentMediaGallery from '../../components/InstrumentMediaGallery'
import AudioPlayer from '../../components/AudioPlayer'
import { useTranslation } from 'react-i18next'

const InstrumentDetail = ({ route }) => {
    const parmas = route?.params;
    const data = parmas?.data;
    const [index, setIndex] = useState(0)
    const [playing, setPlaying] = useState(false)
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useNewStyles(lang);
    const { isDark } = useAppTheme();
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <InstrumentMediaGallery instrument={data} onVideoPlay={() => setPlaying(false)} />
                <View style={{ padding: '5%' }}>
                    <AudioPlayer audio={[{ 'file_path': data?.file_path }]} index={index} setIndex={setIndex} playing={playing} setPlaying={setPlaying} />
                    <Text style={isDark ? NewStyles.title10 : NewStyles.title}>{data?.title}</Text>
                    <Text style={[NewStyles.text10, { marginVertical: 10, lineHeight: 24 }]}>{data?.description}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default InstrumentDetail
