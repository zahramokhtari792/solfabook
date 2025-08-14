import { FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor5 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { fetchUser } from '../../slices/userSlice';
import WithdrawalItem from '../../components/WithdrawalItem';
import { useTranslation } from 'react-i18next';
import BlankScreen from '../../components/BlankScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Decrease({ navigation }) {

    const dispatch = useDispatch()
    const { t } = useTranslation();
    const token = useSelector((state) => state?.auth?.token)
    const [refreshing, setRefreshing] = useState(true)
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(null)
    const [iban, setIban] = useState(null)

    const decreaseWallet = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/submitWithdraw`, { amount: amount, iban:iban}, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            if (response.status === 201) {
                dispatch(fetchUser(token));
                fetchData();
                showToastOrAlert(response?.data?.message);
                setAmount(null);
                setIban(null)
            }
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false);
        }
    }

    const [data, setData] = useState([]); 
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/fetch_withdraws`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            setData(response?.data);
        } catch (error) {
            handleError(error)
        } finally {
            setRefreshing(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [refreshing]);

    return (
        <SafeAreaView style={NewStyles.container} edges={{top:'off', bottom:Platform.OS==='ios' ? 'off' :'additive'}}>
            <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false}>
                <Text style={NewStyles.text}>{t('Enter your desired amount in Tomans.')} <Text style={NewStyles.title6}>*</Text></Text>
                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, NewStyles.shadow]} keyboardType='number-pad' placeholder={t('Amount in Tomans')} placeholderTextColor={themeColor3.bgColor(1)} maxLength={10} value={amount?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChangeText={(text) => { setAmount(text?.replace(/,/g, "")) }} />
                <Text style={NewStyles.text}>{t('Enter your IBAN number.')} <Text style={NewStyles.title6}>*</Text></Text>
                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, NewStyles.shadow]}  placeholder={t('IBAN Number')} placeholderTextColor={themeColor3.bgColor(1)} value={iban} onChangeText={(text) => { setIban(text?.replace(/,/g, "")) }} />
                <FlatList
                    contentContainerStyle={[styles.flatListContainer, NewStyles.center]}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    ListEmptyComponent={()=>{
                        return(
                            <BlankScreen/>
                        )
                    }}
                    refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                    data={data}
                    keyExtractor={(item) => item?.id?.toString()}
                    ListHeaderComponent={data.length > 0 ? <Text style={NewStyles.title}>درخواست‌های شما</Text> : null}
                    renderItem={({ item }) => {
                        return (
                            <WithdrawalItem item={item} />
                        )
                    }}
                />
            </ScrollView>
            <View style={[NewStyles.nav, NewStyles.shadow,{paddingBottom:15}]}>
                <Button title={t('Submit')} loading={loading} onPress={() => decreaseWallet()} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        gap: 10,
    },
    flatListContainer: {
        paddingVertical: '5%',
        gap: 10,
    }
});