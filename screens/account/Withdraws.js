import { FlatList, Linking, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { uri } from '../../services/URL';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import NewStyles, { deviceWidth } from '../../styles/NewStyles';
import { Ionicons } from '@expo/vector-icons';
import BlankScreen from '../../components/BlankScreen';
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser } from '../../slices/userSlice';
import moment from 'moment-timezone';
import { imageUri } from '../../services/URL';
import { formatPrice, showToastOrAlert } from '../../helpers/Common';
import { themeColor0, themeColor11, themeColor4, themeColor6, themeColor7 } from '../../theme/Color';
import { useTranslation } from 'react-i18next';
import BackHeader from '../../components/BackHeader';

export default function Withdraws({ navigation }) {

    const user = useSelector(state => state.user);
    const userToken = useSelector(state => state?.auth?.token);
    const jalaali = require('jalaali-js')
    const [loader, setLoader] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const dispatch = useDispatch()
    const formatToLocalTime = (utcDate) => {
        return moment(utcDate).local().format('YYYY-MM-DD HH:mm:ss');
    };
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/userWithdrawRequest`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            setData(response?.data);
        } catch (error) {
            const message = error.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [refreshing]);

    if (loading) return <Loader />;
    return (
        <SafeAreaView style={NewStyles.container}>
            <CustomStatusBar />
            <BackHeader title={'درخواست‌های برداشت'} />
            <FlatList
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl onRefresh={() => { setRefreshing(true); dispatch(fetchUser(userToken)); fetchData() }} refreshing={refreshing} />}
                // style={{ flex: 1, }}
                data={data}

                ListEmptyComponent={() => {
                    return (<BlankScreen message={'درخواستی یافت نشد.'} />)
                }}
                renderItem={({ item }) => {
                    return (
                        <View style={{ alignItems: 'center' }}>
                            <View style={[styles.providerWrapper, { alignItems: 'center' }]} >
                                <View style={[NewStyles.providerItemProfileWrapper, { marginBottom: 10 }]} onPress={() => { }}>
                                    <View style={[NewStyles.rowWrapper]}>
                                        <Text style={NewStyles.text1}>درخواست برداشت {item.id}
                                        </Text>
                                        <Ionicons name="wallet-outline" size={24} color={themeColor0.bgColor(1)} style={NewStyles.ml5} />
                                    </View>
                                </View>
                                <View style={[NewStyles.rowWrapper, { marginBottom: 10, width: '100%', gap: 5 }]}>
                                    <Text style={NewStyles.text10}>تاریخ ارسال درخواست</Text>
                                    <Text style={NewStyles.text1}>{jalaali.toJalaali(new Date(item?.created_at)).jy}/{jalaali.toJalaali(new Date(item?.created_at)).jm}/{jalaali.toJalaali(new Date(item?.created_at)).jd}  {formatToLocalTime(item?.created_at).substring(11, 19)}</Text>
                                </View>
                                <View style={[NewStyles.rowWrapper, { marginBottom: 10, width: '100%', gap: 5 }]}>
                                    <Text style={NewStyles.text10}>وضعیت درخواست</Text>
                                    <Text style={[NewStyles.text1, item.status == 0 && { color: themeColor11.bgColor(1) }, item.status == 3 && { color: themeColor7.bgColor(1) }, item.status == 2 && { color: themeColor6.bgColor(1) }]}>{item.status == 0 && 'در حال بررسی'}{item.status == 1 && 'تأیید شده'}{item.status == 2 && 'رد شده'}{item.status == 3 && 'پایان یافته'}</Text>
                                </View>
                                <View style={[NewStyles.rowWrapper, { marginBottom: 10, width: '100%', gap: 5 }]}>
                                    <Text style={NewStyles.text10}>نام صاحب حساب</Text>
                                    <Text style={[NewStyles.text1, { flex: 1, textAlign: 'left' }]}>{item.account_name}</Text>
                                </View>
                                <View style={[NewStyles.rowWrapper, { marginBottom: 10, width: '100%', gap: 5 }]}>
                                    <Text style={NewStyles.text10}>شماره کارت</Text>
                                    <Text style={[NewStyles.text1, { flex: 1, textAlign: 'left' }]}>{item.card_no}</Text>
                                </View>
                                <View style={[NewStyles.rowWrapper, { marginBottom: 10, width: '100%', gap: 5 }]}>
                                    <Text style={NewStyles.text10}>شماره شبا</Text>
                                    <Text style={[NewStyles.text1, { flex: 1, textAlign: 'left' }]}>{item.iban}</Text>
                                </View>
                                {(item?.updated_at && item?.status == 3) && <View style={[NewStyles.rowWrapper, { marginBottom: 10, width: '100%', gap: 5 }]}>
                                    <Text style={NewStyles.text10}>تاریخ پایان درخواست</Text>
                                    <Text style={[NewStyles.text1, {}]}>{jalaali.toJalaali(new Date(item?.updated_at)).jy}/{jalaali.toJalaali(new Date(item?.updated_at)).jm}/{jalaali.toJalaali(new Date(item?.updated_at)).jd}  {formatToLocalTime(item?.updated_at).substring(11, 19)}</Text>
                                </View>}
                                <View style={[NewStyles.rowWrapper, { marginBottom: 10, width: '100%', gap: 5 }]}>
                                    <Text style={NewStyles.text10}>مبلغ</Text>
                                    <Text style={[NewStyles.text1, { flex: 1, textAlign: 'left' }]}>{formatPrice(item?.price)} تومان</Text>
                                </View>
                                {item?.file_path && <View style={[NewStyles.rowWrapper, { marginBottom: 10, width: '100%', gap: 5 }]}>
                                    <Text style={NewStyles.text10}>فیش واریزی</Text>
                                    <Pressable onPress={() => {
                                        Linking.openURL(`${imageUri}/${item?.file_path}`)
                                    }}>
                                        <Text style={NewStyles.text1}>مشاهده فیش</Text>
                                    </Pressable>
                                </View>}
                                {item?.response && <View style={[NewStyles.rowWrapper, { marginBottom: 10, width: '100%', gap: 5 }]}>
                                    <Text style={NewStyles.text10}>توضیحات</Text>
                                    <Text style={[NewStyles.text1, { flex: 1, textAlign: 'left' }]}>{item.response}</Text>
                                </View>}
                            </View>
                        </View>
                    )
                }} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    providerWrapper: {
        width: deviceWidth * 0.95,
        backgroundColor: themeColor4.bgColor(1),
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderRadius: 8,
        borderCurve: 'continuous',
        // overflow: 'hidden',
        padding: 15,
        marginVertical: 10,
        // IOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        // Android
        elevation: 3,
    },
})
