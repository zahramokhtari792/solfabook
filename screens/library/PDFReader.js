import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios';
import { dlUrl, imageUri, mainUri, uri } from './../../services/URL';
import { useSelector } from 'react-redux';
import { handleError } from '../../helpers/Common';
import Loader from '../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import NewStyles from '../../styles/NewStyles';
import Pdf from 'react-native-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioPlayer from '../../components/AudioPlayer';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as ScreenOrientation from 'expo-screen-orientation';

const PDFReader = ({ route }) => {
    const params = route?.params;
    const id = params?.id;
    const userToken = useSelector(state => state.auth?.token);
    const [data, setData] = useState()
    const [audio, setAudio] = useState([])
    const [loader, setLoader] = useState(true)
    const [lastPage, setLastPage] = useState(1);
    const [musicIndex, setMusicIndex] = useState(0);
    const [playing, setPlaying] = useState(false);



    const fetchFiles = () => {
        axios.post(`${uri}/fetchFiles`, { id: id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                setData(res?.data?.file_pdf)
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
        checkCookie()
        fetchFiles()
    }, []))

    const checkCookie = async () => {
        const lastPage = await AsyncStorage.getItem('lastPage');
        const file_id = await AsyncStorage.getItem('file_id');
        if (file_id == id) {
            setLastPage(parseInt(lastPage))
        }
    }

    const setCoockie = async (page) => {
        await AsyncStorage.setItem('lastPage', page);
        await AsyncStorage.setItem('file_id', id?.toString());
    }

   
    useEffect(() => {
        // وقتی صفحه باز شد → اجازه چرخش بده
        ScreenOrientation.unlockAsync();

        return () => {
            // وقتی صفحه بسته شد → دوباره قفل کن (مثلاً فقط portrait)
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        };
    }, []);
    
    if (loader) {
        return (<Loader />)
    }
    return (
        <SafeAreaView style={NewStyles.container}>
            {
                audio?.length > 0 &&
                <AudioPlayer audio={audio} playing={playing} setPlaying={setPlaying} index={musicIndex} setIndex={setMusicIndex} />
            }
            <View style={{ flex: 1 }}>
                <Pdf maxScale={10} showsVerticalScrollIndicator enablePaging singlePage={false} trustAllCerts={false} page={lastPage} onPageChanged={(val) => { setCoockie(val.toString()); }} source={{ uri: `${dlUrl}/${data?.[0]?.file_path}`, cache: false }} onLoadComplete={() => {
                    setLoader(false);
                }} style={{ flex: 1, width: '100%' }} />
            </View>
        </SafeAreaView>
    )
}

export default PDFReader

const styles = StyleSheet.create({})