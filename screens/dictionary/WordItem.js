import { Animated, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import NewStyles from '../../styles/NewStyles'
import { TouchableOpacity } from 'react-native'
import SpeackerIcon from '../../assets/svg/SpeackerIcon'
import { themeColor0, themeColor1, themeColor10 } from '../../theme/Color'
import { useNavigation } from '@react-navigation/native'
import { Easing } from 'react-native'

const WordItem = ({ item, playing, onPress, onPress1, audioPath }) => {
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
        <View style={[NewStyles.rowWrapper, { height: 50 }]}>
            {item?.audio_path && (
                <TouchableOpacity onPress={onPress}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        {/* دایره پالس */}
                        {playing && audioPath == item?.audio_path ? (
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
                                <SpeackerIcon color={themeColor0.bgColor(1)} />

                            </Animated.View>
                        )

                            :
                            <View style={[{
                                width: 40,
                                height: 40,
                            }, NewStyles.center]}>
                                <SpeackerIcon color={themeColor10.bgColor(1)} />
                            </View>

                        }
                        {/* آیکن */}
                    </View>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={[!item?.audio_path && { width: '100%' },{flex:1}]} onPress={() => {

                onPress1()
            }}>
                <Text style={[NewStyles.text10, { textAlign: 'left',  textAlignVertical: 'center', }]}>{item?.word}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default WordItem

const styles = StyleSheet.create({})