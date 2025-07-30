import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';
import { showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor1, themeColor3, themeColor4 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';

export default function ChangePassword() {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const userToken = useSelector(state => state?.auth?.token);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const validatePassword = () => {
        const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
        if (password.match(pattern)) {
            return true;
        } else {
            return false;
        }
    };

    const changePassword = async () => {
        if (password !== passwordConfirmation) {
            const message = t('Password and password confirmation do not match.');
            showToastOrAlert(message);
            return;
        }
        if (!validatePassword()) {
            const message = t('Password is not Valid.');
            showToastOrAlert(message);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/changePassword`, { password }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            if (response.status === 200) {
                const message = t('Your changes have been applied.');
                showToastOrAlert(message);
                dispatch(fetchUser(userToken));
            }
        } catch (error) {
            const message = error.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }

    return (
        <View style={NewStyles.container}>
            <CustomStatusBar />
            <ScrollView contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { dispatch(fetchUser(userToken)); }} />}>
                <Text style={NewStyles.text1}>{t('8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.')}</Text>
                <TextInput style={[NewStyles.textInput, NewStyles.text1, NewStyles.border10]} secureTextEntry={true} keyboardType='default' placeholderTextColor={themeColor3.bgColor(1)} placeholder={`${t('Password')}`} value={password} onChangeText={setPassword} />
                <Text style={NewStyles.text1}>{t('Enter Password Confirmation.')}</Text>
                <TextInput style={[NewStyles.textInput, NewStyles.text1, NewStyles.border10]} secureTextEntry={true} keyboardType='default' placeholderTextColor={themeColor3.bgColor(1)} placeholder={`${t('Password Confirmation')}`} value={passwordConfirmation} onChangeText={setPasswordConfirmation} />
                <Button title={`${t('Change Password')}`} loading={loading} onPress={changePassword} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        gap: 5,
    }
})