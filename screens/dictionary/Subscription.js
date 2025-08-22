import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import NewStyles from '../../styles/NewStyles'
import axios from 'axios'
import { uri } from '../../services/URL'
import { handleError, showToastOrAlert } from '../../helpers/Common'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser } from '../../slices/userSlice'
import SubscriptionItem from '../../components/SubscriptionItem'
import { useTranslation } from 'react-i18next'
import BlankScreen from '../../components/BlankScreen'
import { themeColor0, themeColor1 } from '../../theme/Color'
import { useLoginModal } from '../../context/LoginProvider'
import PaymentModal from '../../components/PaymentModal'
import Loader from '../../components/Loader'
import * as Linking from "expo-linking";
import { useFocusEffect } from '@react-navigation/native'


const Subscription = ({ navigation }) => {
    const token = useSelector(state => state?.auth?.token);
    const user = useSelector(state => state?.user?.data);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState();
    const [paymentModal, setPaymentModal] = useState(false);
    const { showModal } = useLoginModal();

    const { t } = useTranslation()
    const dispatch = useDispatch()

    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/fetchSubscription`)
            setData(response?.data);

        } catch (error) {
            handleError(error)
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    const subscriptionPayment = async (url) => {
        try {
            // addLinkingListener();
            let result = await Linking.openURL(
                // We add `?` at the end of the URL since the test backend that is used
                // just appends `authToken=<token>` to the URL provided.
                `${uri}/subscription_buy?linkingUri=${Linking.createURL("/?")}&subscriptionId=${subscriptionId}&userId=${user?.id}`
            );
            let redirectData;
            if (result?.url) {
                redirectData = Linking.parse(result.url);
            }
        } catch (error) {
            //
        }
    };

    const subscriptionWalletPayment = () => {
        setPaymentModal(false)
        setLoading(true)
        axios.post(`${uri}/subscription_buy_wallet`, {
            subscriptionId: subscriptionId,
        }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } })
            .then((res) => {
                showToastOrAlert(t(`${res?.data?.message}`))
                navigation.goBack()
            }).catch((error) => {
                handleError(error)
            })
            .finally(() => {
                setLoading(false)
                dispatch(fetchUser(token))
            })
    }
    const handleRedirect = (event) => {
        let data = Linking.parse(event?.url);
        if (data?.queryParams?.Status == 'OK' && data?.queryParams?.type == 'subscription') {
            showToastOrAlert(t('Subscription successfully purchased and activated.'))
            navigation.goBack()
        }
        if (data?.queryParams?.Status === 'NOK' && data?.queryParams?.type == 'subscription') {
            showToastOrAlert(t('Payment encountered an error.'))
        }
        if (data?.queryParams?.Status === 'Forbidden' && data?.queryParams?.type == 'subscription') {
            showToastOrAlert(t(data?.queryParams?.message))
            navigation.goBack()
        }
        dispatch(fetchUser(token))
    };
    useEffect(() => {
        const listener = Linking.addEventListener('url', handleRedirect);

        return () => {
            listener.remove(); // موقع unmount شدن کامپوننت، لیسنر حذف میشه
        };
    }, []);
    useFocusEffect(useCallback(() => {
        if(token){

            dispatch(fetchUser(token))
        }
    }, [token]))

    useEffect(() => {
        fetchData();

    }, [refreshing]);


    if (loading) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={NewStyles.container}>
            <FlatList
                contentContainerStyle={[styles.contentContainerStyle, NewStyles.center,{gap:10, paddingVertical:10}]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor1.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                ListEmptyComponent={<BlankScreen />}
                data={data}
                
                
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item, index }) => (
                    <SubscriptionItem item={item} onPress={() => {
                        if (user) {

                            if (user?.active_subscription == 1) {

                                showToastOrAlert(t('You have an active subscription and cannot purchase a new one.'))
                            } else {
                                setSubscriptionId(item?.id)
                                setPaymentModal(true);
                                // subscriptionPayment(item?.id)
                            }
                        } else {
                            showModal()
                        }
                    }} />
                )}
            />
            <View>
                <PaymentModal modal={paymentModal} setModal={setPaymentModal} wallet={subscriptionWalletPayment} payment={() => { subscriptionPayment()}} />
            </View>
        </SafeAreaView>
    )
}

export default Subscription

const styles = StyleSheet.create({})