import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useCallback, useEffect, useState } from 'react'
import axios from 'axios';
import { dlUrl, uri } from './../../services/URL';
import { useSelector } from 'react-redux';
import { handleError } from '../../helpers/Common';
import Loader from '../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import NewStyles from '../../styles/NewStyles';
import PDFReaderWebView from './PDFReaderWebView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioPlayer from '../../components/AudioPlayer';
import * as ScreenOrientation from 'expo-screen-orientation';
import { usePreventScreenCapture } from 'expo-screen-capture';
import AlbumIcon from '../../assets/svg/AlbumIcon';
import { themeColor0, themeColor5 } from '../../theme/Color';
import ModalPlayer from './ModalPlayer';

const PDFReader = ({ route }) => {
    const params = route?.params;
    const id = params?.id;
    const userToken = useSelector(state => state.auth?.token);
    const [data, setData] = useState()
    const [audio, setAudio] = useState([])
    const [loader, setLoader] = useState(true)
    const [lastPage, setLastPage] = useState(1);
    const [musicIndex, setMusicIndex] = useState(0);
    const [visible, setVisible] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [playNow, setPlayNow] = useState(false);
    usePreventScreenCapture();




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
                <View style={{}}>
                    <TouchableOpacity style={{ padding: 5, marginHorizontal: 15, marginTop: 5, alignSelf: 'flex-end' }} onPress={() => {
                        setVisible(true)
                    }}>
                        <AlbumIcon color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                    <Text style={[NewStyles.text10, { textAlign: 'center', marginVertical: 10, paddingHorizontal: '5%' }]}>{audio?.[musicIndex]?.title}</Text>

                    <AudioPlayer audio={audio} playing={playing} setPlaying={setPlaying} index={musicIndex} setIndex={setMusicIndex} playNow={playNow} />

                </View>
            }
            <View style={{ flex: 1 }}>
                <PDFReaderWebView 
                    route={{ 
                        params: { 
                            pdfUrl: `${dlUrl}/${data?.[0]?.file_path}`, 
                            id: id 
                        } 
                    }} 
                />
            </View>
            <ModalPlayer visible={visible} setVisible={setVisible} audio={audio} musicIndex={musicIndex} setMusicIndex={setMusicIndex} playing={playing} setPlayNow={setPlayNow} />
        </SafeAreaView>
    )
}

export default PDFReader

const styles = StyleSheet.create({})