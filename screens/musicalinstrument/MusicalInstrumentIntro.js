import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNewStyles } from '../../styles/NewStyles';
import axios from 'axios'
import { uri } from '../../services/URL'
import { handleError } from '../../helpers/Common'
import Loader from '../../components/Loader'
import { useAppTheme } from '../../context/ThemeProvider'
import Button from '../../components/Button'
import { useTranslation } from 'react-i18next'
import Video from 'react-native-video'
import { imageUri } from '../../services/URL'

const MusicalInstrumentIntro = ({ navigation, route }) => {
    const videoPath = route?.params?.introVideoPath;
    const introVideoUrl = typeof videoPath === 'string' && videoPath.trim()
        ? (/^https?:\/\//i.test(videoPath) ? videoPath : `${imageUri}/${videoPath.replace(/^\/?(?:storage\/)?/, '')}`)
        : null;
    const [showIntroVideo, setShowIntroVideo] = useState(Boolean(introVideoUrl));
    const [data, setData] = useState([]);
    const [loader, setLoader] = useState(true)
    const { i18n, t } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useNewStyles(lang);
    const { colors, isDark } = useAppTheme();
    const allIntro = () => {
        axios.get(`${uri}/allIntro?lang=${lang}`)
            .then((res) => {
                setData(res?.data)
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
            })
    }
    useEffect(() => {
        allIntro()
    }, [])
    // Autoplay without user controls; on completion or playback error, show the introduction.
    if (showIntroVideo && introVideoUrl) {
        return (
            <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={[NewStyles.container, styles.videoContainer]}>
                <Video
                    source={{ uri: introVideoUrl }}
                    style={styles.video}
                    resizeMode="contain"
                    controls={false}
                    paused={false}
                    repeat={false}
                    onEnd={() => setShowIntroVideo(false)}
                    onError={(error) => {
                        console.warn('SolfaSaz introduction video error', error);
                        setShowIntroVideo(false);
                    }}
                />
            </SafeAreaView>
        );
    }
    if (loader) {
        return (<Loader />);
    }
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <FlatList
                data={data}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                renderItem={({ item }) => (
                    <View style={styles.introItem}>
                        {typeof item?.title === 'string' && item.title.trim().length > 0 && (
                            <Text style={[NewStyles.heading, styles.introTitle, { color: isDark ? colors.text : colors.primary }]}>
                                {item.title}
                            </Text>
                        )}
                        <Text style={[NewStyles.text10, styles.introDescription]}>
                            {item?.description}
                        </Text>
                    </View>
                )}
                ListFooterComponent={
                    <View style={styles.footer}>
                        <Button
                            title={t("Enter SolfaSaz")}
                            onPress={() => navigation.navigate('MusicalInstrument')}
                        />
                    </View>
                }
            />
        </SafeAreaView>
    )
}

export default MusicalInstrumentIntro

const styles = StyleSheet.create({
    videoContainer: { backgroundColor: '#000000', justifyContent: 'center' },
    video: { width: '100%', flex: 1 },
    listContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    introItem: {
        width: '100%',
        paddingHorizontal: 8,
        paddingVertical: 8,
        // Transparent background: exactly the same surface as the parent page.
    },
    itemSeparator: { height: 20 },
    introTitle: {
        fontSize: 18,
        lineHeight: 30,
        textAlign: 'center',
        marginBottom: 8,
    },
    introDescription: {
        fontSize: 15,
        lineHeight: 27,
    },
    footer: {
        marginTop: 26,
        marginBottom: 14,
    },
});
