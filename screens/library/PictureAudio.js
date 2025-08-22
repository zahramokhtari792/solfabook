import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios';
import { dlUrl, imageUri, mainUri, uri } from './../../services/URL';
import { useSelector } from 'react-redux';
import { handleError } from '../../helpers/Common';
import Loader from '../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import NewStyles from '../../styles/NewStyles';
import AudioPlayer from '../../components/AudioPlayer';
import ModalPlayer from './ModalPlayer';
import { TouchableOpacity } from 'react-native';
import AlbumIcon from '../../assets/svg/AlbumIcon';
import { themeColor0 } from '../../theme/Color';
import { usePreventScreenCapture } from 'expo-screen-capture';

const PictureAudio = ({ route }) => {
    const params = route?.params;
    const id = params?.id;
    const userToken = useSelector(state => state.auth?.token);
    const [data, setData] = useState()
    const [audio, setAudio] = useState([])
    const [loader, setLoader] = useState(true)
    const [lastPage, setLastPage] = useState(1);
    const [musicIndex, setMusicIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [visible, setVisible] = useState(false);
    const [playNow, setPlayNow] = useState(false);
    usePreventScreenCapture()
    
    const fetchFiles = () => {
        axios.post(`${uri}/fetchFiles`, { id: id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                setData(res?.data?.file_image)
                setAudio(res?.data?.file_audio)

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


    if (loader) {
        return (<Loader />)
    }
    return (
        <SafeAreaView style={NewStyles.container}>
            {
                audio?.length > 0 &&
                <View>
                    <TouchableOpacity style={{ padding: 5, marginHorizontal: 15, marginTop: 5, alignSelf: 'flex-end' }} onPress={() => {
                        setVisible(true)
                    }}>
                        <AlbumIcon color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                    <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 10, paddingHorizontal: 10 }]}>{audio?.[musicIndex]?.title}</Text>
                    <AudioPlayer audio={audio} playing={playing} setPlaying={setPlaying} index={musicIndex} setIndex={setMusicIndex} playNow={playNow} />
                </View>
            }
            <View style={{ flex: 1 }}>
                <Image style={{ height: '100%', width: '100%', resizeMode: 'contain' }} source={{ uri: `${dlUrl}/${data?.[0]?.file_path}` }} />
            </View>
            <ModalPlayer visible={visible} setVisible={setVisible} audio={audio} musicIndex={musicIndex} setMusicIndex={setMusicIndex} playing={playing} setPlayNow={setPlayNow} />

        </SafeAreaView>
    )
}

export default PictureAudio

const styles = StyleSheet.create({})