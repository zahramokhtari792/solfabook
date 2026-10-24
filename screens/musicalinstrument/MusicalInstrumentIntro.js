import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNewStyles } from '../../styles/NewStyles';
import axios from 'axios'
import { uri } from '../../services/URL'
import { handleError } from '../../helpers/Common'
import Loader from '../../components/Loader'
import { themeColor4 } from '../../theme/Color'
import { useAppTheme } from '../../context/ThemeProvider'
import Button from '../../components/Button'
import { BlurView } from 'expo-blur'
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
    // Play the optional video first. The intro is available even if video fails.
    if (showIntroVideo && introVideoUrl) {
        return (
            <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={[NewStyles.container, styles.videoContainer]}>
                <Video
                    source={{ uri: introVideoUrl }}
                    style={styles.video}
                    resizeMode="contain"
                    controls
                    paused={false}
                    repeat={false}
                    onEnd={() => setShowIntroVideo(false)}
                    onError={(error) => {
                        console.warn('SolfaSaz introduction video error', error);
                        setShowIntroVideo(false);
                    }}
                />
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Skip video')}
                    style={styles.skipButton}
                    onPress={() => setShowIntroVideo(false)}
                >
                    <Text style={styles.skipText}>{t('Skip video')}</Text>
                </Pressable>
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
                contentContainerStyle={{ paddingHorizontal: 30, paddingTop: 12 }}
                renderItem={({ item }) => {
                    return (
                        <BlurView intensity={10} tint={isDark ? 'dark' : 'light'} style={{ backgroundColor: isDark ? 'rgba(36, 36, 36, 0.88)' : themeColor4.bgColor(0.8), borderRadius: 10, paddingHorizontal: 10 }}>

                            {typeof item?.title === 'string' && item.title.trim().length > 0 && (
                                <Text style={[NewStyles.heading, { fontSize: 20, color: isDark ? colors.text : colors.primary, textAlign: 'center' }]}>{item.title}</Text>
                            )}
                            <Text style={[NewStyles.text10, { fontSize: 15 }]}>{item?.description}</Text>
                        </BlurView>
                    )
                }}
                ListFooterComponent={() => {
                    return (
                        <View style={{ marginVertical: 20 }}>

                            <Button title={t("Enter SolfaSaz")} onPress={() => {
                                navigation.navigate('MusicalInstrument')
                            }} />
                        </View>
                    )
                }}
            />
        </SafeAreaView>
    )
}

export default MusicalInstrumentIntro

const styles = StyleSheet.create({
    videoContainer: { backgroundColor: '#000000', justifyContent: 'center' },
    video: { width: '100%', flex: 1 },
    skipButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.55)',
    },
    skipText: { color: '#FFFFFF', fontSize: 14 },
});
