import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import Slider from '@react-native-community/slider';

import { Ionicons } from '@expo/vector-icons';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor1 } from '../theme/Color';
import PlayBackIcon from '../assets/svg/PlayBackIcon';
import PlayForwardIcon from '../assets/svg/PlayForwardIcon';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { dlUrl } from '../services/URL';


export default function AudioPlayer({ audio, index, setIndex, playing, setPlaying, playNow }) {


    const [total, setTotal] = useState(0)
    const [width, setWdith] = useState(0)
    const [tempWidth, setTempWidth] = useState(width);
    const player = useAudioPlayer(`${dlUrl}/${audio[index]?.file_path}`);
    const status = useAudioPlayerStatus(player);
    setAudioModeAsync({ shouldPlayInBackground: true })

    const pauseSound = () => {
        if (player) {
            player.pause();
        }
    };
    const playSound = () => {

        if (player) {
            if (total === width) {
                player.seekTo(0);
            }
            player.play();
        }
    };
    const prev = () => setIndex(i => Math.max(i - 1, 0));
    const next = () => setIndex(i => Math.min(i + 1, audio.length - 1));
    useEffect(() => {
        if (!status) return;

        if (!isNaN(status.duration) && status.duration != null) {
            setTotal(status.duration * 1000);
        }

        if (!isNaN(status.currentTime) && status.currentTime != null) {
            setWdith(status.currentTime * 1000);
        }

        setPlaying(status.playing);

        if (status.didJustFinish || status.currentTime >= status.duration) {
            setPlaying(false);
        }
    }, [status]);

    useEffect(() => {
        if (playNow) {
            playSound()
        } else {
            pauseSound()
        }
    }, [playNow, index])


    function millisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
    return (
        <View style={[{}]}>
            <View style={{ marginTop: 10 }}>
                <Slider
                    step={1}
                    minimumValue={0}
                    maximumValue={total}
                    minimumTrackTintColor={themeColor0.bgColor(1)}
                    maximumTrackTintColor={themeColor1.bgColor(1)}
                    thumbTintColor={themeColor0.bgColor(1)}
                    value={width}
                    onValueChange={(value) => {
                        setTempWidth(value);

                    }}

                    onSlidingComplete={(value) => {
                        player.seekTo(value / 1000); // چون expo-audio به ثانیه می‌خواد
                        setWdith(value);
                    }}

                />
                <View style={[NewStyles.rowWrapper, { paddingHorizontal: 15 }]}>
                    <Text style={[NewStyles.text, { fontSize: 11, color: themeColor0.bgColor(1) }]}>{millisToMinutesAndSeconds(total)}</Text>
                    <Text style={[NewStyles.text, { fontSize: 11, color: themeColor0.bgColor(1) }]}>{millisToMinutesAndSeconds(tempWidth)}</Text>
                </View>
            </View>
            <View style={[NewStyles.row, NewStyles.center, { gap: 10 }]}>
                {audio?.length > 1 && <TouchableOpacity onPress={next} style={{ padding: 5 }} disabled={index === audio?.length - 1}>
                    <PlayForwardIcon color={index === audio?.length - 1 ? themeColor1.bgColor(0.7) : themeColor0.bgColor(1)} />
                </TouchableOpacity>}
                {(!playing) &&
                    <TouchableOpacity onPress={() => {
                        playSound(); setPlaying(true);
                    }}>
                        <Ionicons name="play-circle" size={40} color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                }
                {(playing) &&
                    <TouchableOpacity onPress={() => { pauseSound(); setPlaying(false); }}><Ionicons name="pause-circle" size={40} color={themeColor0.bgColor(1)} /></TouchableOpacity>
                }
                {audio?.length > 1 && <TouchableOpacity style={{ padding: 5 }} onPress={prev} disabled={index === 0}>
                    <PlayBackIcon color={index > 0 ? themeColor0.bgColor(1) : themeColor1.bgColor(0.7)} />
                </TouchableOpacity>}
            </View>
        </View>
    )
}