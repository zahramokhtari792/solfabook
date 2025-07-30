import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor1 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import BlankScreen from '../../components/BlankScreen';
import TransactionItem from '../../components/TransactionItem';

export default function Transactions() {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const userToken = useSelector(state => state?.auth?.token);

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/fetchTransactions`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
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
        <View style={NewStyles.container}>
            <CustomStatusBar />
            <FlatList
                contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                ListEmptyComponent={<BlankScreen />}
                data={data}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item }) => {
                    return (
                        <TransactionItem item={item} />
                    )
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingVertical: '5%',
        gap: 5,
    },
})