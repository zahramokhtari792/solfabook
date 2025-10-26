import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import i18n from 'i18next';

import { setDeviceInfo, setToken } from '../slices/authSlice';
import { setLanguage } from '../slices/languageSlice';
import { fetchUser } from '../slices/userSlice';
import { fetchContacts } from '../slices/contactSlice';

import DeviceInfo from 'react-native-device-info';
import NewStyles from '../styles/NewStyles';
import CustomStatusBar from '../components/CustomStatusBar';
import { View } from 'react-native';

export default function Landing() {

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const userToken = useSelector(state => state?.auth?.token);
    const getDeviceId = async () => {
        DeviceInfo.getUniqueId().then((uniqueId) => {
            // iOS: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
            // Android: "dd96dec43fb81c97"
            // Windows: "{2cf7cb3c-da7a-d508-0d7f-696bb51185b4}"
            dispatch(setDeviceInfo(uniqueId))
        });
    }
    useEffect(() => {
        getDeviceId()
    }, [])
    const loadLanguage = async () => {
        try {
            const language = await AsyncStorage.getItem('lang');
            if (language) {
                dispatch(setLanguage(language));
                i18n.changeLanguage(language);
            } else {
                i18n.changeLanguage('en');
            }
        } catch (error) {
            console.error('Error loading language', error);
        }
    };

    const fetchUserToken = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            dispatch(setToken(userToken));
        } catch (error) {
            console.error('Error fetching user token', error);
        }
    };

    useEffect(() => {
        loadLanguage();
        fetchUserToken();
        // dispatch(fetchContacts());
        navigation.navigate('MainLayout');
    }, []);

    useEffect(() => {
        if (userToken) {
            dispatch(fetchUser(userToken));
        }
    }, [userToken]);

    return (
        <View style={NewStyles.container}>
            <CustomStatusBar />
        </View>
    );
}

