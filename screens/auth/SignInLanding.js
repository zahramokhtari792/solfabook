import { View, Text } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import NewStyles from '../../styles/NewStyles';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import LoginModal from './LoginModal';

export default function SignInLanding() {

    const { t } = useTranslation();
    const userToken = useSelector(state => state?.auth?.token);

    const [loginModal, setLoginModal] = useState(true);
    useFocusEffect(
        useCallback(() => {
            if (!userToken) {
                setLoginModal(true);
            }
        }, [userToken]),
    );

    return (
        <View style={[NewStyles.container, NewStyles.center]}>
            <CustomStatusBar />
            <Text style={NewStyles.text4}>{t('For accessing your account, please sign in first.')}</Text>
            <View style={{ width: '50%' }}>
                <Button title={`${t('Sign In')}`} onPress={() => { setLoginModal(true) }} />
            </View>
            <LoginModal loginModal={loginModal} setLoginModal={setLoginModal} />
        </View>
    )
}