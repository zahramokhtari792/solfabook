import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor1 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import BlankScreen from '../../components/BlankScreen';
import SubscriptionItem from '../../components/SubscriptionItem';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../../slices/userSlice';
import SubscriptionPaymentModal from '../../components/SubscriptionPaymentModal';
import * as Linking from "expo-linking";

export default function Subscription() {

    const { t } = useTranslation();
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [paymentModal, setPaymentModal] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState();
    const userToken = useSelector(state => state?.auth?.token);
    const user = useSelector(state => state?.user?.data);

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/fetchSubscriptions`)
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
        dispatch(fetchUser(userToken))
    }, [refreshing]);

    const [active, setActive] = useState();

    const handleRedirect = (event) => {
        let data = Linking.parse(event?.url);
        if (data?.queryParams?.Status == 'OK') {
            showToastOrAlert('success')
            dispatch(fetchUser(userToken))
        }
        if (data?.queryParams?.Status === 'NOK') {
            showToastOrAlert('failed')
        }
        if (data?.queryParams?.Status === 'Forbidden') {
            showToastOrAlert(t(data?.queryParams?.message))
        }
    };

    const addLinkingListener = () => {
        Linking.addEventListener("url", handleRedirect);
    };

    const subscriptionPayment = async () => {
        try {
            addLinkingListener();
            let result = await Linking.openURL(
                // We add `?` at the end of the URL since the test backend that is used
                // just appends `authToken=<token>` to the URL provided.
                `${uri}/subscriptionPayment?linkingUri=${Linking.createURL("/?")}&subscriptionId=${subscriptionId}&userId=${user?.id}`
            );
            let redirectData;
            if (result?.url) {
                redirectData = Linking.parse(result.url);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const subscriptionWalletPayment = () => {
        axios.post(`${uri}/subscriptionWalletPayment`, {
            subscriptionId: subscriptionId
        }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                showToastOrAlert(t(`${res?.data?.success}`))
                dispatch(fetchUser(userToken))
            }).catch((error) => {
                if (error.response.status == 409) {
                    showToastOrAlert(t(`${error?.response?.data?.error}`))
                }else if(error.response.status == 401){
                    showToastOrAlert(t(`Unauthorized access. Please login.`))
                } else {
                    const message = error.response ? t('An unexpected error occurred!') : t('Network error!');
                    showToastOrAlert(message);
                }
            })
    }

    if (loading) return <Loader />;

    return (
        <View style={NewStyles.container}>
            <CustomStatusBar />
            <FlatList
                contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                ListEmptyComponent={<BlankScreen />}
                data={data}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item, index }) => (
                    <SubscriptionItem item={item} index={index} active={active} setActive={setActive} onPress={() => {
                        if (user?.active_subscription == 1) {
                            showToastOrAlert(t('You have an active subscription and cannot purchase a new one.'))
                        } else {
                            setSubscriptionId(item?.id)
                            setPaymentModal(true);
                        }
                    }} />
                )}
            />
            <SubscriptionPaymentModal title={'خرید اشتراک'} gatewayPayment={subscriptionPayment} walletPayment={subscriptionWalletPayment} message={'کدام روش پرداخت را ترجیح می دهید؟'} paymentModal={paymentModal} setPaymentModal={setPaymentModal} />
        </View>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingVertical: '5%',
        gap: 5,
    },
})