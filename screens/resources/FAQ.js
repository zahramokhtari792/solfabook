import { FlatList, Platform, RefreshControl, StyleSheet, ToastAndroid, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { uri } from '../../services/URL';
import makeStyles from '../../styles/NewStyles';
import { themeColor1 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import BlankScreen from '../../components/BlankScreen';
import AccordionItem from '../../components/AccordionItem';
import BackHeader from '../../components/BackHeader';

export default function FAQ() {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/fetchFaq`);
            setData(response?.data);
        } catch (error) {
            Platform.OS === 'android' ? ToastAndroid.show(`${t('Something went wrong!')}`, ToastAndroid.SHORT) : alert(`${t('Something went wrong!')}`);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [refreshing]);

    const [active, setActive] = useState();

    return (
        <View style={NewStyles.container}>
            <CustomStatusBar />
            <BackHeader title={'سوالات متداول'} />

            {loading && <Loader />}
            <FlatList
                contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                ListEmptyComponent={<BlankScreen />}
                data={data}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item, index }) => (
                    <AccordionItem item={item} index={index} active={active} setActive={setActive} />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 1,
    },
})