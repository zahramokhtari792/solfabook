import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomStatusBar from '../../components/CustomStatusBar';

import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from 'react-native';
import { themeColor0, themeColor1, themeColor10, themeColor11, themeColor4, themeColor6, themeColor7, themeColor8 } from '../../theme/Color';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';

import axios from 'axios';
import { fetchUser } from '../../slices/userSlice';
import AntDesign from '@expo/vector-icons/AntDesign';
import BankAccountModal from '../../components/BankAccountModal';
import BlankScreen from '../../components/BlankScreen';
import * as Linking from "expo-linking";
import { uri } from '../../services/URL';
import moment from 'moment-timezone';
import { useFocusEffect } from '@react-navigation/native';
import NewStyles, { deviceWidth } from '../../styles/NewStyles';
import Button from '../../components/Button';
import { formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';
import TransactionItem from '../../components/TransactionItem';
import { useTranslation } from 'react-i18next';


export default function Wallet({ navigation }) {

    const user = useSelector(state => state.user?.data);
    const userToken = useSelector(state => state?.auth?.token);
    const [section, setSection] = useState('charging')
    const [amountWithdraw, setAmountWithdraw] = useState()
    const [loading, setLoading] = useState(false)
    const [transactionsLoading, settransactionsLoading] = useState(false)
    const [withdrawLoading, setWithdrawLoading] = useState(false)
    const [price, setPrice] = useState('');

    const dispatch = useDispatch()

    const [data, setData] = useState([]);

    const isUserLoggedIn = () => {
        if (userToken) {
            return true;
        } else {
            setLoginModal(true);
            return false;
        }
    }
    const _handleRedirect = (event) => {
        let data = Linking.parse(event.url);
        console.log(data?.queryParams?.Status)
        if (data?.queryParams?.Status === 'OKWallet') {
            dispatch(fetchUser(userToken))
            showToastOrAlert('کیف پول شما با موفقیت شارژ شد.')
        }
        if (data?.queryParams?.Status === 'NOKWallet') {
            showToastOrAlert('پرداخت با خطا مواجه شد.')
        }
    };
    const _addLinkingListenerWallet = () => {
        Linking.addEventListener("url", _handleRedirect);
    };
    const charge = async () => {
        setPrice("")
        try {
            _addLinkingListenerWallet()
            let result = await Linking.openURL(
                // We add `?` at the end of the URL since the test backend that is used
                // just appends `authToken=<token>` to the URL provided.
                `${uri}/walletCharge?linkingUri=${Linking.createURL(
                    "/?"
                )}&price=${price}&userId=${user?.id}`
            );
            let redirectData;
            if (result.url) {
                redirectData = Linking.parse(result.url);
            }



        } catch (error) {
            handleError(error)
        }
    }
    const withDraw = () => {

        if (amountWithdraw > 0) {
            setWithdrawLoading(true)
            axios.post(`${uri}/userSubmitWithdrawRequest`, { amountWithdraw: amountWithdraw }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
                .then((res) => {
                    showToastOrAlert('درخواست شما با موفقیت ثبت شد.')
                    setAmountWithdraw('')
                }).catch((error) => {
                    handleError(error)
                }).finally(() => {
                    dispatch(fetchUser(userToken))
                    setWithdrawLoading(false)
                })
        } else {
            showToastOrAlert('مقدار وارد شده باید عدد انگلیسی باشد.')
        }
    }
    const formatToLocalTime = (utcDate) => {
        return moment(utcDate).local().format('YYYY-MM-DD HH:mm:ss');
    };
    useFocusEffect(useCallback(() => {
        isUserLoggedIn()
        if (userToken) {
            dispatch(fetchUser(userToken))
            fetchData()
        }
    }, []))

    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/fetch_transactions`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            setData(response?.data);
            
        } catch (error) {
            
            
            handleError(error)
        } finally {
            settransactionsLoading(false);
            setLoading(false);
        }
    };
    
    return (
        <SafeAreaView style={NewStyles.container}>
            <CustomStatusBar />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                style={{ flex: 1 }}
            >
                <ScrollView refreshControl={<RefreshControl refreshing={transactionsLoading} onRefresh={() => { settransactionsLoading(true); fetchData(); dispatch(fetchUser(userToken))}} />}>
                    <View style={{ width: deviceWidth * 0.9, height: 230, backgroundColor: themeColor4.bgColor(1), elevation: 10, alignSelf: 'center', marginTop: 10, borderRadius: 10, shadowOpacity: 0.5, shadowColor: themeColor10.bgColor(0.5) }}>
                        <View style={{ flex: 1.5, backgroundColor: themeColor10.bgColor(1), borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
                            <LinearGradient colors={[themeColor0.bgColor(1), themeColor8.bgColor(1)]} style={{ height: '100%', width: '100%', borderTopRightRadius: 10, borderTopLeftRadius: 10, justifyContent: 'center', alignItems: 'center', }} start={{ x: 0.3, y: 0.2, }} end={{ x: 0.5, y: 1 }}>
                                <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'space-between', width: '90%', alignSelf: 'center', flexDirection: 'row-reverse' }}>
                                    <Text style={{ color: themeColor4.bgColor(1), textAlign: 'right', fontSize: 12, fontFamily: 'VazirLight' }}>{user?.bank_name}</Text>
                                    <Pressable onPress={() => {
                                        navigation.navigate('BankInfo')
                                    }}>
                                        <AntDesign name="edit" size={20} color={themeColor4.bgColor(1)} />
                                    </Pressable>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 2, width: '90%', alignSelf: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontFamily: 'VazirLight', color: themeColor4.bgColor(1), fontSize: 16, textAlign: 'center' }}>موجودی کیف پول</Text>
                                    <Text style={{ fontFamily: 'VazirLight', color: themeColor4.bgColor(1), fontSize: 16, textAlign: 'center' }}>{formatPrice(user?.wallet)} تومان</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center', paddingBottom: 10, width: '90%', alignSelf: 'center' }}>
                                    <Text style={{ color: themeColor4.bgColor(1), textAlign: 'right', fontSize: 11, fontFamily: 'VazirLight' }}>{user?.iban}</Text>
                                </View>
                            </LinearGradient>
                        </View>
                        <View style={{ flex: 1, backgroundColor: themeColor4.bgColor(1), borderBottomRightRadius: 10, borderBottomLeftRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', }}>
                            {user?.card_no ? <>
                                <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'VazirBold', fontSize: 16 }}>{user?.card_no?.slice(0, 4)}</Text>
                                <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'VazirBold', fontSize: 16 }}>{user?.card_no?.slice(4, 8)}</Text>
                                <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'VazirBold', fontSize: 16 }}>{user?.card_no?.slice(8, 12)}</Text>
                                <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'VazirBold', fontSize: 16 }}>{user?.card_no?.slice(12, 16)}</Text>
                            </>
                                :
                                <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'VazirLight', fontSize: 14 }}>شماره کارت خود را وارد نکرده اید</Text>
                            }
                        </View>
                    </View>
                    <View style={{ width: deviceWidth * 0.9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'center', marginTop: 10 }}>
                        <Pressable onPress={() => { setSection('charging') }} style={{ flex: 1, elevation: 2, borderRadius: 10, }}>
                            <LinearGradient colors={[section == 'charging' ? themeColor0.bgColor(1) : themeColor4.bgColor(1), section == 'charging' ? themeColor8.bgColor(1) : themeColor4.bgColor(1)]} style={[{ height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }]} start={{ x: 0.3, y: 0.2, }} end={{ x: 0.5, y: 1 }}>
                                <Text style={[NewStyles.text1, section == 'charging' && { color: themeColor4.bgColor(1) }]}>شارژ کیف پول</Text>
                            </LinearGradient>
                        </Pressable>
                        <Pressable onPress={() => { setSection('transactions'); fetchData() }} style={[{ flex: 1, elevation: 2, borderRadius: 10, marginHorizontal: 5 }]}>
                            <LinearGradient colors={[section == 'transactions' ? themeColor0.bgColor(1) : themeColor4.bgColor(1), section == 'transactions' ? themeColor8.bgColor(1) : themeColor4.bgColor(1)]} style={[{ height: 50, elevation: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }]} start={{ x: 0.3, y: 0.2, }} end={{ x: 0.5, y: 1 }}>
                                <Text style={[NewStyles.text1, section == 'transactions' && { color: themeColor4.bgColor(1) }]}>تراکنش‌ها</Text>
                            </LinearGradient>
                        </Pressable>
                        <Pressable onPress={() => { setSection('withdraw') }} style={[{ flex: 1, elevation: 2, borderRadius: 10 }, section == 'withdraw' && { backgroundColor: themeColor0.bgColor(1) }]}>
                            <LinearGradient colors={[section == 'withdraw' ? themeColor0.bgColor(1) : themeColor4.bgColor(1), section == 'withdraw' ? themeColor8.bgColor(1) : themeColor4.bgColor(1)]} style={[{ height: 50, elevation: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }]} start={{ x: 0.3, y: 0.2, }} end={{ x: 0.5, y: 1 }}>
                                <Text style={[NewStyles.text1, section == 'withdraw' && { color: themeColor4.bgColor(1) }]}>برداشت</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                    {section == 'charging' && <View style={{ backgroundColor: themeColor4.bgColor(1), elevation: 2, marginTop: 10, width: deviceWidth * 0.9, alignSelf: 'center', borderRadius: 10 }}>
                        <View style={styles.groupFeild}>
                            <Text style={NewStyles.text1}>مبلغ مورد نظر برای شارژ کیف پول به تومان</Text>
                            <TextInput style={[NewStyles.textInput, NewStyles.text1, { marginVertical: 10, borderRadius: 5, backgroundColor: themeColor1.bgColor(0.1) }]} keyboardType='number-pad' value={price} onChangeText={(text) => {
                                setPrice(text)
                            }} placeholder={'مبلغ مورد نظر'} />
                            <Button title={'شارژ'} loading={loading} onPress={() => {
                                if (price > 10000) {
                                    charge()
                                } else {
                                    Platform.OS === 'android' ? ToastAndroid.show('حداقل مبلغ برای شارژ کیف پول ۱۰.۰۰۰ تومان می باشد.', ToastAndroid.SHORT) : alert('حداقل مبلغ برای شارژ کیف پول ۱۰.۰۰۰ تومان می باشد.')
                                }
                            }} />
                        </View>
                    </View>}
                    {section == 'transactions' && <View style={{ marginTop: 10, width: deviceWidth , alignSelf: 'center', flex: 1 }}>
                        <FlatList
                            scrollEnabled={false}
                            
                            showsVerticalScrollIndicator={false}
                            data={data}
                            contentContainerStyle={{ gap: 10, paddingBottom: 10 , width:'100%', alignItems:'center'}}
                            ListEmptyComponent={() => {
                                return (
                                    <BlankScreen message={'تراکنشی یافت نشد.'} customStyle={{ height: 'auto' }} />
                                )
                            }}
                            renderItem={({ item }) => {
                                return (
                                    <TransactionItem item={item} />
                                )
                            }}
                        />
                    </View>}
                    {section == 'withdraw' && <View style={{ backgroundColor: themeColor4.bgColor(1), elevation: 2, marginTop: 10, width: deviceWidth * 0.9, alignSelf: 'center', borderRadius: 10 }}>
                        <View style={styles.groupFeild}>
                            <Text style={NewStyles.text1}>مبلغ درخواستی به تومان</Text>
                            <TextInput value={amountWithdraw} style={[NewStyles.textInput, NewStyles.text1, { marginTop: 5, borderRadius: 5, marginBottom: 10, backgroundColor: themeColor1.bgColor(0.1) }]} keyboardType='number-pad' placeholder={'مبلغ درخواستی را وارد کنید.'} onChangeText={(p) => {
                                setAmountWithdraw(p)
                            }} />
                            <Button title={'ثبت درخواست'} loading={withdrawLoading} onPress={() => {
                                if (amountWithdraw) {
                                    withDraw()


                                } else {
                                    Platform.OS === 'android' ? ToastAndroid.show('لطفا مبلغ درخواستی خود را وارد کنید.', ToastAndroid.SHORT) : alert('لطفا مبلغ درخواستی خود را وارد کنید.')
                                }
                            }} />
                            <View style={{ marginTop: 10 }}>
                                <Pressable style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                                    navigation.navigate('Withdraws')
                                }}>
                                    <Text style={NewStyles.text1}>درخواست‌های برداشت</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    groupFeild: {
        width: '90%',
        alignSelf: 'center',
        marginTop: 10,
        paddingBottom: 15
    },
    flatListItemContainer1: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,

    },

    flatListItem1: {
        width: '100%',
        height: 180,
        padding: 20,
        // borderRadius: 8,
        // borderColor: yellow,
        alignItems: 'center',
        justifyContent: 'space-between',
        // borderWidth: 1,
        elevation: 2,
        backgroundColor: themeColor4.bgColor(1)

    },
})