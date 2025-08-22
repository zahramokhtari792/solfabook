import { View, Text, Modal, StyleSheet, TouchableWithoutFeedback, TextInput, Platform, ToastAndroid, Pressable, Linking, KeyboardAvoidingView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell, } from 'react-native-confirmation-code-field';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';

import { mainUri, uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';

import { themeColor0, themeColor1, themeColor10, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import Button from '../../components/Button';
import TransparentButton from '../../components/TransparentButton';
import { setToken } from '../../slices/authSlice';
import { useTranslation } from 'react-i18next';
import NewStyles from '../../styles/NewStyles';
import { Ionicons } from '@expo/vector-icons';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { useLoginModal } from '../../context/LoginProvider';
import { TouchableOpacity } from 'react-native';
export default function LoginModal() {
    const { loginModal, hideModal, } = useLoginModal();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [loginWithPassword, setLoginWithPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [value, setValue] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState(false);
    const [error, setError] = useState('');
    const [deviceInfo, setDeviceInfo] = useState('');
    const device = useSelector(state => state.auth?.deviceInfo)
    const ref = useBlurOnFulfill({ value, cellCount: 6 });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const validatePhone = () => {
        if (phone.match(/^09\d{9}$/)) {
            return true;
        } else {
            return false;
        }
    };

    

    const sendVerificationCode = async () => {
        try {
            const response = await axios.post(`${uri}/sendVerificationCode`, { phone: phone, device: device })
            if (response?.data?.success == 'success') {
                setCode(true);
                setError('');
            } else if (response?.data?.error == 'error') {
                setError(`${t('Failed to send code. Please make sure the phone number you entered is correct.')}`)
            }
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false);
        }
    };

    const codeVerification = async () => {
        try {
            const response = await axios.post(`${uri}/codeVerification`, { phone: phone, code: value, device: device })
            if (response?.data?.success == 'success') {
                const userId = JSON.stringify(response?.data?.userId);
                const userToken = response?.data?.token?.replace('"', "");
                await AsyncStorage.setItem('userId', userId);
                await AsyncStorage.setItem('userToken', userToken);
                dispatch(setToken(userToken));
                dispatch(fetchUser(userToken));
                setPhone('');
                setValue('');
                setCode(false);
                setError('');
                hideModal()
            } else if (response?.data?.error == 'error') {
                setValue('');
                setError(`${t('The entered code is not correct!')}`)
            }
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false);
        }
    };

    const passwordVerification = async () => {
        try {
            const response = await axios.post(`${uri}/passwordVerification`, { phone: phone, password: password, device: device })
            if (response?.data?.success == 'success') {
                const userId = JSON.stringify(response?.data?.userId);
                const userToken = response?.data?.token?.replace('"', "");
                await AsyncStorage.setItem('userId', userId);
                await AsyncStorage.setItem('userToken', userToken);
                dispatch(fetchUser(userToken));
                dispatch(setToken(userToken));
                setPhone('');
                setValue('');
                setCode(false);
                setError('');
                hideModal()
            } else if (response?.data?.error == 'error') {
                setValue('');
                setError(`${t('The entered password is not correct!')}`)
            }
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false);
        }
    };


    return (
        <Modal animationType='fade' style={{ }} transparent={true} visible={loginModal} onRequestClose={() => { hideModal() }}>
            <KeyboardAvoidingView behavior={Platform.OS == "ios" ? 'height' : 'height'} keyboardVerticalOffset={0} style={{ flex: 1 }}>
                <View style={[styles.container, NewStyles.center]}>
                    <View style={[styles.modalView, NewStyles.border10]}>
                        <View style={[NewStyles.rowWrapper]}>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Pressable style={{ padding: 5, }} onPress={() => { hideModal() }}>
                                    <Ionicons name='close-outline' size={20} color={themeColor10.bgColor(1)} />
                                </Pressable>
                            </View>
                            <Text style={NewStyles.title10}>{t('Login | Register')}</Text>
                            <View style={{ flex: 1 }} />
                        </View>
                        {!code ?
                            <View style={styles.wrapper}>
                                <Text style={NewStyles.text10}>{t('Please enter your phone number. A verification code will be sent to your phone number.')}</Text>
                                <TextInput style={[NewStyles.textInput, { backgroundColor: themeColor3.bgColor(0.2) }, NewStyles.text, NewStyles.border10]} keyboardType='number-pad' placeholderTextColor={themeColor3.bgColor(1)} maxLength={11} placeholder={`${t('Phone Number')}`} value={phone} onChangeText={(text) => setPhone(text)} onTouchStart={() => { setError('') }} />
                                <Text style={NewStyles.text10}>{t('Your submission indicates your agreement to our terms of service and privacy policy.')}</Text>
                                <View style={[NewStyles.row, { alignSelf: 'center' }]}>
                                    <TouchableOpacity onPress={() => {
                                        Linking.openURL(`${mainUri}/terms`)
                                    }}><Text style={[NewStyles.text10, { color: themeColor0.bgColor(1) }]}>{t('Terms & Conditions')}</Text></TouchableOpacity>
                                    <Text style={NewStyles.text10}> {t('&')} </Text>
                                    <TouchableOpacity onPress={() => {
                                        Linking.openURL(`${mainUri}/privacies`)
                                    }}>
                                        <Text style={[NewStyles.text10, { color: themeColor0.bgColor(1) }]}>{t('privacy policy')}</Text>
                                    </TouchableOpacity>
                                </View>
                                {error && <Text style={NewStyles.text6}>{error}</Text>}
                                <Button title={`${t('Send code')}`} loading={loading} onPress={() => { if (validatePhone()) { setLoading(true); sendVerificationCode(); } else { setError(`${t('The mobile number you entered is not valid.')}`) } }} />
                                <TransparentButton title={`${t('Login With Password')}`} onPress={() => { if (validatePhone()) { setCode(true); setLoginWithPassword(true) } else { setError(`${t('The mobile number you entered is not valid.')}`) } }} />
                            </View>
                            :
                            loginWithPassword ?
                                <View style={[styles.wrapper, { width: '95%' }]}>
                                    <Text style={[NewStyles.text10, { marginBottom: 10 }]}>{t('Please enter your password.')}</Text>
                                    <TextInput style={[NewStyles.textInput, { backgroundColor: themeColor3.bgColor(0.2) }, NewStyles.text1, NewStyles.border10]} keyboardType='default' key={loginModal ? 'password-open' : 'password-closed'} placeholderTextColor={themeColor3.bgColor(1)} secureTextEntry maxLength={18} placeholder={`${t('Password')}`} value={password} onChangeText={(text) => setPassword(text)} />
                                    {error && <Text style={NewStyles.text6}>{error}</Text>}
                                    <Button title={`${t('Submit')}`} loading={loading} onPress={() => { if (password) { setLoading(true); passwordVerification(); } else { showToastOrAlert('رمز عبور خود را وارد کنید.') } }} />
                                    <View style={NewStyles.center}>
                                        <Text style={NewStyles.text3}>{t("Forgot your password?")}</Text>
                                        <View style={NewStyles.rowWrapper}>
                                            <TransparentButton title={`${t('Change Phone Number')}`} onPress={() => { setError(''); setValue(''); setPhone(''); setCode(false); setLoginWithPassword(false); setPassword('') }} />
                                            <Text style={NewStyles.text3}>  {t('or')}  </Text>
                                            <TransparentButton title={`${t('Login With Code')}`} onPress={() => { if (validatePhone()) { setLoading(true); setLoginWithPassword(false); sendVerificationCode(); } else { setError(`${t('The mobile number you entered is not valid.')}`) } }} />
                                        </View>
                                    </View>
                                </View>
                                :
                                <View style={styles.wrapper}>
                                    <Text style={NewStyles.text10}>{t('A verification code has been sent to')} {phone}.</Text>
                                    <CodeField
                                        ref={ref}
                                        {...props}
                                        value={value}
                                        onChangeText={(text) => { setValue(text); }}
                                        cellCount={6}
                                        keyboardType="number-pad"
                                        textContentType="oneTimeCode"
                                        autoComplete={Platform.select({ android: 'sms-otp', default: 'one-time-code' })}
                                        renderCell={({ index, symbol, isFocused }) => (
                                            <Text
                                                key={index}
                                                style={[styles.cell, NewStyles.border10]}
                                                onLayout={getCellOnLayoutHandler(index)}>
                                                {symbol || (isFocused ? <Cursor /> : null)}
                                            </Text>
                                        )}
                                    />
                                    {error && <Text style={NewStyles.text6}>{error}</Text>}
                                    <Button title={`${t('Submit')}`} loading={loading} onPress={() => { if (value?.length === 6) { setLoading(true); codeVerification(); } else { setError(`${t('Please enter the code correctly.')}`) } }} />
                                    <View style={NewStyles.center}>
                                        <Text style={NewStyles.text3}>{t("Didn't you receive a verification code?")}</Text>
                                        <View style={NewStyles.rowWrapper}>
                                            <TransparentButton title={`${t('Change Phone Number')}`} onPress={() => { setError(''); setValue(''); setPhone(''); setCode(false); }} />
                                            <Text style={NewStyles.text10}>  {t('or')}  </Text>
                                            <TransparentButton title={`${t('Resend Code')}`} onPress={() => { setLoading(true); setValue(''); sendVerificationCode(); }} />
                                        </View>
                                    </View>
                                </View>}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColor1.bgColor(0.8),
    },
    modalView: {
        height: '40%',
        minHeight: 400,
        width: '85%',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: themeColor4.bgColor(1),
    },
    wrapper: {
        // flex: 1,
        // justifyContent: 'space-between'
    },
    cell: {
        width: 40,
        height: 40,
        backgroundColor: themeColor3.bgColor(0.2),
        fontSize: 20,
        color: themeColor3.bgColor(1),
        fontFamily: 'VazirLight',
        textAlign: 'center',
        lineHeight: 40,
    },
});