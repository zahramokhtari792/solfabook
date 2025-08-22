import { Animated, Easing, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import NewStyles, { deviceHeight } from '../../styles/NewStyles'
import axios from 'axios'
import { dlUrl, imageUri, uri } from '../../services/URL'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import SpeackerIcon from '../../assets/svg/SpeackerIcon'
import { themeColor0, themeColor10 } from '../../theme/Color'
import { TouchableOpacity } from 'react-native'
import BookmarkIcon from './../../assets/svg/BookmarkIcon';
import { useSelector } from 'react-redux'
import BookmarkFillIcon from './../../assets/svg/BookmarkFillIcon';
import { handleError } from '../../helpers/Common'
import { useLoginModal } from '../../context/LoginProvider'
import { usePreventScreenCapture } from 'expo-screen-capture'

const WordDetail = ({ route }) => {
    const params = route?.params;
    const word = params.word;
    const player = useAudioPlayer(`${dlUrl}/${word?.audio_path}`);
    const status = useAudioPlayerStatus(player);
    const [playing, setPlaying] = useState(false);
    const userToken = useSelector(state => state?.auth?.token);
    const [saved, setSaved] = useState(false)
    const { showModal } = useLoginModal();
    usePreventScreenCapture()
    
    const bookmarked = () => {
        axios.post(`${uri}/bookmarkDictionary`, { dictionary_id: word?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                if (res?.data?.message == 'saved') {
                    setSaved(true)
                } else {
                    setSaved(false)
                }
            })
            .catch((err) => {
                handleError(err)
            })
    }
    const checkBookmarked = () => {
        axios.post(`${uri}/chekBookmarkDictionary`, { dictionary_id: word?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                if (res?.data?.message == 'saved') {
                    setSaved(true)
                } else {
                    setSaved(false)
                }
            })
    }


    useEffect(() => {
        if (userToken) {
            checkBookmarked()
        }
    }, [userToken])


    useEffect(() => {
        if (!status) return;


        setPlaying(status.playing);


    }, [status]);
    const pauseSound = () => {
        if (player) {
            player.pause();
        }
    };
    const playSound = () => {

        if (player) {
            player.play();
        }
    };
    const scaleAnim = useRef(new Animated.Value(1)).current
    const opacityAnim = useRef(new Animated.Value(0.6)).current

    useEffect(() => {
        if (playing) {
            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(scaleAnim, {
                            toValue: 1.2,
                            duration: 800,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleAnim, {
                            toValue: 1,
                            duration: 800,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(opacityAnim, {
                            toValue: 0.2,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 0.6,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start()
        } else {
            scaleAnim.setValue(1)
            opacityAnim.setValue(0.6)
        }
    }, [playing])

    return (
        <SafeAreaView edges={{ top: 'off' }} style={NewStyles.container}>
            <ScrollView>
                {
                    word?.image_path && <Image source={{ uri: `${dlUrl}/${word?.image_path}` }} style={{ width: '100%', height: deviceHeight * 0.3, resizeMode: 'contain' }} />
                }
                <View style={{ padding: '5%' }}>
                    <View style={NewStyles.rowWrapper}>
                        <View style={NewStyles.row}>
                            <TouchableOpacity onPress={() => {
                                if (userToken) {
                                    bookmarked()
                                } else {
                                    showModal()
                                }
                            }}>
                                {saved ? <BookmarkFillIcon color={themeColor0.bgColor(1)} size='22' /> : <BookmarkIcon color={themeColor10.bgColor(1)} size='22' />}

                            </TouchableOpacity>
                            {word?.audio_path && <TouchableOpacity onPress={() => {
                                if (playing) {
                                    pauseSound()
                                } else {
                                    playSound()
                                }
                            }}>
                                <View style={[NewStyles.center]}>
                                    {playing ? (
                                        <Animated.View
                                            style={[{
                                                // position: 'absolute',
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                backgroundColor: themeColor0.bgColor(0.3),
                                                transform: [{ scale: scaleAnim }],
                                                opacity: opacityAnim,
                                            }, NewStyles.center]}
                                        >
                                            <SpeackerIcon size='25' color={themeColor0.bgColor(1)} />

                                        </Animated.View>
                                    )

                                        :
                                        <View style={[{
                                            width: 40,
                                            height: 40,
                                        }, NewStyles.center]}>
                                            <SpeackerIcon size='25' color={themeColor10.bgColor(1)} />
                                        </View>

                                    }
                                </View>
                            </TouchableOpacity>}
                        </View>
                        <View>
                            <Text style={[NewStyles.text10, { textAlign: word?.origin_dir }]}>{word?.word}</Text>
                            <Text style={NewStyles.text3}>{word?.pronunciation}</Text>
                        </View>
                    </View>
                    <Text style={[NewStyles.text10, { textAlign: word?.destination_dir }]}>{word?.word_equivalent}</Text>
                    {word?.description && <Text style={[NewStyles.text10, { textAlign: word?.destination_dir }]}>{word?.description}</Text>}
                </View>
            </ScrollView>
            <View>

            </View>
        </SafeAreaView>
    )
}

export default WordDetail

const styles = StyleSheet.create({})