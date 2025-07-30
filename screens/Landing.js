import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import i18n from 'i18next';

import { setToken } from '../slices/authSlice';
import { setLanguage } from '../slices/languageSlice';
import { fetchUser } from '../slices/userSlice';
import { fetchContacts } from '../slices/contactSlice';

import NewStyles from '../styles/NewStyles';
import CustomStatusBar from '../components/CustomStatusBar';
import { View } from 'react-native';

export default function Landing() {

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const userToken = useSelector(state => state?.auth?.token);

    const loadLanguage = async () => {
        try {
            const language = await AsyncStorage.getItem('lang');
            if (language) {
                dispatch(setLanguage(language));
                i18n.changeLanguage(language);
            } else {
                i18n.changeLanguage('fa');
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
            console.error(error);
        }
    };

    useEffect(() => {
        loadLanguage();
        fetchUserToken();
        dispatch(fetchContacts());
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

