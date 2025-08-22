import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import NewStyles from '../../styles/NewStyles'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { dlUrl, uri } from '../../services/URL'
import { handleError } from '../../helpers/Common'
import Loader from '../../components/Loader'
import WordItem from '../dictionary/WordItem'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { useFocusEffect } from '@react-navigation/native'
import { themeColor0, themeColor3, themeColor4 } from '../../theme/Color'
import BlankScreen from '../../components/BlankScreen'
import { LinearGradient } from 'expo-linear-gradient'
import Button from '../../components/Button'

const BookmarkedWords = ({ navigation }) => {
    const userToken = useSelector(state => state.auth?.token);
    const user = useSelector(state => state.user?.data);
    const [data, setData] = useState([]);
    const [audioPath, setAudioPath] = useState()
    const [playing, setPlaying] = useState(false);

    const [loader, setLoader] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const player = useAudioPlayer(`${dlUrl}/${audioPath}`);
    const status = useAudioPlayerStatus(player);
    useEffect(() => {
        if (!status) return;


        setPlaying(status.playing);


    }, [status]);
    const pauseSound = () => {
        if (player) {
            player.pause();
            setAudioPath()
        }
    };
    const playSound = () => {

        if (player) {
            player.play();
        }
    };
    useEffect(() => {

        if (player && audioPath) {
            playSound()
        }
    }, [player])
    const fetchAllBookmarkedWords = () => {
        axios.get(`${uri}/fetchBokkmarkedDictionary`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                setData(res?.data)
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
                setRefreshing(false)
            })
    }
    useFocusEffect(useCallback(() => {
        fetchAllBookmarkedWords()
    }, []))
    if (loader) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            <FlatList
                scrollEnabled={(!user || user?.active_subscription == 0) ? false : true}
                data={data}
                ItemSeparatorComponent={() => {
                    return (
                        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: themeColor3.bgColor(1), width: '100%' }} />
                    )
                }}
                keyExtractor={(item) => item?.id?.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
                    setRefreshing(true)
                    fetchAllBookmarkedWords()
                }} />}
                ListEmptyComponent={() => {
                    return (
                        <BlankScreen />
                    )
                }}
                contentContainerStyle={[{ paddingHorizontal: '5%' }, (data?.length === 0) && { flex: 1 }]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    return (
                        <WordItem onPress1={() => {
                            if (player && audioPath) {
                                pauseSound()
                            }
                            navigation.navigate('WordDetail', { word: item?.dictionary });
                        }} onPress={() => {
                            setAudioPath(item?.dictionary?.audio_path);
                        }} playing={playing} audioPath={audioPath} item={item?.dictionary} />
                    )
                }}
            />
            {(user?.active_subscription == 0 || !user) && (
                <View style={{ width: '100%', height: 190, position: 'absolute', bottom: 0 }}>
                    <LinearGradient
                        colors={[themeColor4.bgColor(0.1), themeColor0.bgColor(0.8)]}
                        style={[{
                            height: '100%',
                            width: '100%',
                            paddingBottom: 20,
                        }, NewStyles.center]}
                    >
                        <View style={{ width: '90%' }}>
                            <Button
                                title={'شما اشتراک فعالی ندارید'}
                                onPress={() => {
                                    navigation.navigate('Subscription');
                                }}
                            />
                        </View>
                    </LinearGradient>
                </View>
            )}
        </SafeAreaView>
    )
}

export default BookmarkedWords

const styles = StyleSheet.create({})