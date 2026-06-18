import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useTranslation } from 'react-i18next';

import { setDeviceInfo, setToken } from '../slices/authSlice';
import { setLanguage } from '../slices/languageSlice';
import makeStyles from '../styles/NewStyles';
import CustomStatusBar from '../components/CustomStatusBar';
import { useInternetStatus } from '../hooks/useInternetStatus';
import { fetchUser } from './../slices/userSlice';

export default function Landing() {

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const isOnline = useInternetStatus(); // null | true | false

    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);

    const [bootReady, setBootReady] = useState(false);
    const [storedToken, setStoredToken] = useState(undefined);

    /* -------------------------------------------------- */
    /* Load language + device id                          */
    /* -------------------------------------------------- */

    useEffect(() => {

        const init = async () => {

            // language
            const language = await AsyncStorage.getItem('lang');
            if (language) {
                dispatch(setLanguage(language));
                i18n.changeLanguage(language);
            } else {
                i18n.changeLanguage('fa');
            }

            // device id
            const uniqueId = await DeviceInfo.getUniqueId();
            dispatch(setDeviceInfo(uniqueId));

            // token
            const token = await AsyncStorage.getItem('userToken');
            setStoredToken(token);
            dispatch(setToken(token));
            dispatch(fetchUser(token))

            setBootReady(true);
        };

        init();

    }, []);

    /* -------------------------------------------------- */
    /* Decide navigation (ONLY when ready)                */
    /* -------------------------------------------------- */

    useEffect(() => {

        if (!bootReady) return;
        if (isOnline === null) return; // internet not resolved yet

        navigation.reset({
            index: 0,
            routes: [{ name: 'MainLayout' }],
        });

    }, [bootReady, isOnline]);

    return (
        <View style={NewStyles.container}>
            <CustomStatusBar />
        </View>
    );
}
