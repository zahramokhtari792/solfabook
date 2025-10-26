import React, { useEffect, useState } from 'react';
import { FlatList, ImageBackground, Linking, Platform, RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import { imageUri, mainUri, uri } from '../../services/URL';
import { appVersion, cleanText, handleError } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import BackHeader from '../../components/BackHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import BlankScreen from '../../components/BlankScreen';

export default function AboutUs() {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const lang = useSelector(state => state?.lang?.lang);

    const [data, setData] = useState([]);
    const [socials, setSocials] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/resources`);
            setData(response?.data?.abouts);
            setSocials(response?.data?.socials);
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [refreshing]);
    if (loading) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <FlatList
                contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                ListEmptyComponent={<BlankScreen />}
                data={data}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item, index }) => (
                    <View>
                        <ImageBackground style={styles.imageBackground} blurRadius={2} source={{ uri: `${imageUri}/${item?.image_path}` }}>
                            <LinearGradient style={[{ flex: 1, paddingHorizontal: '5%' }, NewStyles.center]} colors={[themeColor0.bgColor(0.5), themeColor0.bgColor(0.4), themeColor10.bgColor(0.4), themeColor10.bgColor(0.7)]}>
                                <Text style={[NewStyles.title4, { fontSize: 20 }]}>{item?.title}</Text>
                            </LinearGradient>
                        </ImageBackground>
                        <View style={[{ paddingHorizontal: '5%' }, NewStyles.center]}>
                            <Text style={[NewStyles.text10, { paddingVertical: '5%' }]}>{cleanText(item?.description)}</Text>


                        </View>
                    </View>
                )}
                ListFooterComponent={() => {
                    return (
                        <View>

                            <Text style={NewStyles.text3}>{appVersion()} V</Text>
                        </View>
                    )
                }}
            />
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingBottom: 20,
        gap: 20
    },
    imageBackground: {
        width: '100%',
        height: 250,
    },
})