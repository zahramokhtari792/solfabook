import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import makeStyles from '../../styles/NewStyles';
import { themeColor1, themeColor3, themeColor4 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePassword() {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const userToken = useSelector(state => state?.auth?.token);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [confitmShowPassword, setConfitmShowPassword] = useState(false);
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
                setPassword(null)
                setPasswordConfirmation(null)
            }
        } catch (error) {
            handleError(error)
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    }
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    return (
        <View style={NewStyles.container}>
            <CustomStatusBar />
            <ScrollView contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { dispatch(fetchUser(userToken)); }} />}>
                <Text style={NewStyles.text1}>{t('8 to 15 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.')}</Text>
                <View style={[NewStyles.textInput, NewStyles.shadow, { justifyContent: 'center', paddingHorizontal: 'auto' }, NewStyles.border10, NewStyles.rowWrapper]}>
                    <TextInput style={[NewStyles.text1, { paddingHorizontal: 15, flex: 1 }]} secureTextEntry={!showPassword} keyboardType='default' placeholderTextColor={themeColor3.bgColor(1)} placeholder={`${t('Password')}`} value={password} onChangeText={setPassword} />
                    <TouchableOpacity style={{ paddingHorizontal: 15 }} onPress={() => {
                        setShowPassword(pre => !pre)
                    }}>
                        <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={themeColor1.bgColor(1)} />
                    </TouchableOpacity>
                </View>
                <Text style={NewStyles.text1}>{t('Enter Password Confirmation.')}</Text>
                <View style={[NewStyles.textInput, NewStyles.shadow, { justifyContent: 'center', paddingHorizontal: 'auto' }, NewStyles.border10, NewStyles.rowWrapper]}>
                    <TextInput style={[NewStyles.text1, { paddingHorizontal: 15, flex: 1 }]} secureTextEntry={!confitmShowPassword} keyboardType='default' placeholderTextColor={themeColor3.bgColor(1)} placeholder={`${t('Password Confirmation')}`} value={passwordConfirmation} onChangeText={setPasswordConfirmation} />
                    <TouchableOpacity style={{ paddingHorizontal: 15 }} onPress={() => {
                        setConfitmShowPassword(pre => !pre)
                    }}>
                        <Ionicons name={confitmShowPassword ? 'eye' : 'eye-off'} size={20} color={themeColor1.bgColor(1)} />
                    </TouchableOpacity>
                </View>
                <Button title={`${t('Change Password')}`} loading={loading} onPress={changePassword} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        padding: '5%',
        gap: 5,
    }
})