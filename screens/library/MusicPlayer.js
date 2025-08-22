import { Animated, FlatList, Image, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { dlUrl, uri } from '../../services/URL';
import { useSelector } from 'react-redux';
import { handleError } from '../../helpers/Common';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor4 } from '../../theme/Color';
import Loader from '../../components/Loader';
import AudioPlayer from '../../components/AudioPlayer';
import { Ionicons } from '@expo/vector-icons';
import { usePreventScreenCapture } from 'expo-screen-capture';

const MusicPlayer = ({ route }) => {
    usePreventScreenCapture();

    const params = route?.params;
    const file = params?.file
    const [galleries, setGallery] = useState([])
    const [audio, setAudio] = useState([])
    const [loader, setLoader] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0);
    const [musicIndex, setMusicIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [playNow, setPlayNow] = useState(false);
    const userToken = useSelector(state => state.auth?.token);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const fetchFiles = () => {
        axios.post(`${uri}/fetchFiles`, { id: file?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                setAudio(res?.data?.file_audio)
                setGallery(res?.data?.galleries)
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
            })
    } 

    useFocusEffect(useCallback(() => {
        fetchFiles()
    }, []))
    useEffect(() => {
        if (galleries?.length < 2) return;

        const interval = setInterval(() => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                // تغییر عکس
                const nextIndex = (currentIndex + 1) % galleries?.length;
                setCurrentIndex(nextIndex);

                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        }, 15000);

        return () => clearInterval(interval);
    }, [currentIndex, galleries?.length]);

    if (loader) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={[NewStyles.container]} edges={{ top: 'off', bottom: 'additive' }}>
            <ImageBackground style={{ flex: 1, paddingTop: 65 }} source={{ uri: `${dlUrl}/${file?.image_gallery?.image_path}` }} imageStyle={{ opacity: 0.5, backgroundColor: themeColor4.bgColor(1) }} blurRadius={25}>
                <Animated.Image
                    source={{ uri: `${dlUrl}/${galleries[currentIndex]?.image_path}` }}
                    style={[{ aspectRatio: 1, width: '80%', objectFit: 'contain', borderRadius: 17, alignSelf: 'center', marginTop: 10, opacity: fadeAnim }]}
                />
                <Text style={[NewStyles.text10, { textAlign: 'center', marginVertical: 10 , paddingHorizontal:'5%'}]}>{audio?.[musicIndex]?.title}</Text>
                {
                    audio && <AudioPlayer audio={audio} setIndex={setMusicIndex} index={musicIndex} playing={playing} setPlaying={setPlaying} playNow={playNow} />
                }

                <FlatList
                    data={audio}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => {
                        return (
                            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: themeColor4.bgColor(1), width: '100%' }} />
                        )
                    }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity onPress={() => {
                                setMusicIndex(index);
                                if (index == musicIndex) { setPlayNow(!playing); } else { setPlayNow(true); }
                            }} style={[NewStyles.row, { width: '90%', alignSelf: 'center', paddingHorizontal: 10, alignItems: 'center', paddingBottom: 15, marginTop: 20, gap: 35 }]}>
                                <Text style={[NewStyles.text10, { flex: 1, textAlign: 'left' }]}>{item?.title}</Text>
                                <View style={[NewStyles.rowWrapper, { gap: 35, width: '25%' }]}>
                                    <View style={{ width: 20, aspectRatio: 1 }}>
                                        <Ionicons name={(index == musicIndex && playing) ? 'pause' : 'play'} color={themeColor10.bgColor(1)} size={20} />
                                    </View>
                                    <Text style={[NewStyles.text10, { minWidth: 30, textAlign: 'left' }]}>{index + 1}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                />
            </ImageBackground>
        </SafeAreaView>
    )
}

export default MusicPlayer

const styles = StyleSheet.create({})