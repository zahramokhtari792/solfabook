import { View, Text, Modal, StyleSheet, TouchableWithoutFeedback, TextInput, Platform, ToastAndroid, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell, } from 'react-native-confirmation-code-field';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';

import { uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';

import { themeColor0, themeColor1, themeColor12, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import Button from '../../components/Button';
import TransparentButton from '../../components/TransparentButton';
import { setToken } from '../../slices/authSlice';
import { useTranslation } from 'react-i18next';
import NewStyles from '../../styles/NewStyles';
import { useNavigation } from '@react-navigation/native';
import { formatTime, persianAppName, showToastOrAlert } from '../../helpers/Common';

export default function LoginModal({ loginModal, setLoginModal }) {
    const navigation = useNavigation()
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [loginWithPassword, setLoginWithPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [value, setValue] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(120);

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
    useEffect(() => {
        if (code) {

            if (timer === 0) return;

            const intervalId = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [timer, code]);
    const validatePassword = () => {
        const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
        if (password.match(pattern)) {
            return true;
        } else {
            return false;
        }
    };

    const sendVerificationCode = async () => {
        try {
            const response = await axios.post(`${uri}/sendVerificationCode`, { phone: phone })
            if (response?.data?.success == 'success') {
                setCode(true);
                setError('');
                setTimer(120)
            } else if (response?.data?.error == 'error') {
                setError(`${t('Failed to send code. Please make sure the phone number you entered is correct.')}`)
            }
        } catch (error) {
            Platform.OS === 'android' ? ToastAndroid.show(`${t('Something went wrong!')}`, ToastAndroid.SHORT) : alert(`${t('Something went wrong!')}`)
        } finally {
            setLoading(false);
        }
    };

    const codeVerification = async () => {
        try {
            const response = await axios.post(`${uri}/codeVerification`, { phone: phone, code: value })
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
                setLoginModal(false);
            } else if (response?.data?.error == 'error') {
                setValue('');
                setError(`${t('The entered code is not correct!')}`)
            }
        } catch (error) {
            console.log(error);

            Platform.OS === 'android' ? ToastAndroid.show(`${t('Something went wrong!')}`, ToastAndroid.SHORT) : alert(`${t('Something went wrong!')}`)
        } finally {
            setLoading(false);
        }
    };

    const passwordVerification = async () => {
        try {
            const response = await axios.post(`${uri}/passwordVerification`, { phone: phone, password: password })
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
                setLoginModal(false);
            } else if (response?.data?.error == 'error') {
                setValue('');
                setError(`${t('The entered password is not correct!')}`)
            }
        } catch (error) {
            Platform.OS === 'android' ? ToastAndroid.show(`${t('Something went wrong!')}`, ToastAndroid.SHORT) : alert(`${t('Something went wrong!')}`)
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal animationType='fade' style={{ backgroundColor: 'red' }} transparent={true} visible={loginModal} onRequestClose={() => { setLoginModal(!loginModal); }}>
            <TouchableWithoutFeedback onPress={() => { setLoginModal(false) }}>
                <View style={[styles.container, NewStyles.center]}>
                    <View style={[styles.modalView, NewStyles.border10]}>
                        <Text style={NewStyles.title10}>{t('Login | Register')}</Text>
                        {!code ?
                            <View style={styles.wrapper}>
                                <Text style={NewStyles.text10}>{t('Please enter your phone number. A verification code will be sent to your phone number.')}</Text>
                                <TextInput style={[NewStyles.textInput, NewStyles.text1, NewStyles.border10]} keyboardType='number-pad' placeholderTextColor={themeColor3.bgColor(1)} maxLength={11} placeholder={`${t('Phone Number')}`} value={phone} onChangeText={(text) => setPhone(text)} onTouchStart={() => { setError('') }} />
                                <View style={[NewStyles.row, { flexWrap: 'wrap', flexDirection: 'row-reverse', gap: 1 }]}>
                                    <Text style={NewStyles.text10}>با ثبت نام در اپلیکیشن {persianAppName} با</Text>
                                    <TouchableOpacity onPress={() => {
                                        navigation.navigate('Terms & Conditions');
                                        setLoginModal(false)
                                    }}><Text style={[NewStyles.text10, { color: themeColor0.bgColor(1) }]}>قوانین و مقررات</Text></TouchableOpacity>
                                    <Text style={NewStyles.text10}> و </Text>
                                    <TouchableOpacity onPress={() => {
                                        setLoginModal(false)
                                        navigation.navigate('Privacy Policy')
                                    }}>
                                        <Text style={[NewStyles.text10, { color: themeColor0.bgColor(1) }]}>سیاست های حریم خصوصی</Text>
                                    </TouchableOpacity>
                                    <Text style={NewStyles.text10}>موافقت می کنید.</Text>
                                </View>
                                {/* <Text style={NewStyles.text10}>{t('Your submission indicates your agreement to our terms of service and privacy policy.')}</Text> */}
                                {error && <Text style={NewStyles.text6}>{error}</Text>}
                                <Button title={`${t('Send code')}`} loading={loading} onPress={() => { if (validatePhone()) { setLoading(true); sendVerificationCode(); } else { setError(`${t('The mobile number you entered is not valid.')}`) } }} />
                                <TransparentButton title={`${t('Login With Password')}`} onPress={() => { if (validatePhone()) { setCode(true); setLoginWithPassword(true) } else { setError(`${t('The mobile number you entered is not valid.')}`) } }} />
                            </View>
                            :
                            loginWithPassword ?
                                <View style={[styles.wrapper, { width: '95%' }]}>
                                    <Text style={[NewStyles.text10, { marginBottom: 10 }]}>{t('Please enter your password.')}</Text>
                                    <TextInput style={[NewStyles.textInput, NewStyles.text1, NewStyles.border10]} keyboardType='default' placeholderTextColor={themeColor3.bgColor(1)} secureTextEntry maxLength={18} placeholder={`${t('Password')}`} value={password} onChangeText={(text) => setPassword(text)} />
                                    {error && <Text style={NewStyles.text6}>{error}</Text>}
                                    <Button title={`${t('Submit')}`} loading={loading} onPress={() => { if (validatePassword()) { setLoading(true); passwordVerification(); } else { setError(`${t('The Password you entered is not valid.')}`) } }} />
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
                                    <Button title={`${t('Submit')}`} loading={loading} onPress={() => {
                                        if (timer>0) {
                                            if (value?.length === 6) { setLoading(true); codeVerification(); } else { setError(`${t('Please enter the code correctly.')}`) }
                                        }else{
                                            showToastOrAlert('کد شما منقضی شده است.')
                                        }
                                    }} />
                                    <View style={NewStyles.center}>
                                        {timer > 0 && <View style={[NewStyles.center, { marginBottom: 10 }]}>
                                            <Text style={[NewStyles.text, { fontFamily: 'VazirBold' }]}>{formatTime(timer)} <Text style={{ color: themeColor3.bgColor(1), fontFamily: 'VazirLight' }}>{t('sce left')}</Text></Text>
                                        </View>}
                                        {timer == 0 && <View style={[NewStyles.row, { flexWrap: 'wrap' }]}>
                                            <Text style={NewStyles.text3}>{t("Didn't you receive a verification code?")}</Text>
                                            <TouchableOpacity onPress={() => { setLoading(true); setValue(''); sendVerificationCode(); }} >
                                                <Text style={[NewStyles.text, { marginHorizontal: 5 }]}>{t('Resend Code')}</Text>
                                            </TouchableOpacity>
                                        </View>}
                                        <View style={NewStyles.rowWrapper}>
                                            <TransparentButton title={`${t('Change Phone Number')}`} onPress={() => { setError(''); setValue(''); setPhone(''); setCode(false); setTimer(120) }} />
                                            {/* <Text style={NewStyles.text10}>  {t('or')}  </Text> */}

                                        </View>
                                    </View>
                                </View>}
                    </View>
                </View>
            </TouchableWithoutFeedback>
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