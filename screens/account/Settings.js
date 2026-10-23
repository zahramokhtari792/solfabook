import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { useNewStyles } from '../../styles/NewStyles'
import { useAppTheme } from '../../context/ThemeProvider'
import OptionsComponents from '../../components/OptionsComponents'
import ThemeModeSwitch from '../../components/ThemeModeSwitch'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { uri } from '../../services/URL'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { handleError, showToastOrAlert } from '../../helpers/Common'
import ConfirmationModal from '../../components/ConfirmationModal'
import Loader from '../../components/Loader'
import { useDispatch, useSelector } from 'react-redux'
import { emptyUser } from '../../slices/userSlice'
import { removeToken } from '../../slices/authSlice'

const Settings = ({ navigation }) => {
    const { t } = useTranslation()
    const userToken = useSelector(state => state?.auth?.token);
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    const { themeMode, setThemeMode, colors } = useAppTheme();
    const [modal, setModal] = useState(false)
    const [loader, setLoader] = useState(false)
    const dispatch = useDispatch()
    const logout = async () => {
        setLoader(true)
        axios.get(`${uri}/logOut`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then(async (res) => {
                await AsyncStorage.removeItem('userId')
                await AsyncStorage.removeItem('userToken')
                dispatch(emptyUser())
                dispatch(removeToken())
                showToastOrAlert(t(res?.data?.message))
                navigation.navigate('MainLayout', { screen: 'Home' })
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
            })
    }
    if (loader) {
        return (<Loader />)
    }
    return (
        <View style={NewStyles.container}>
            <View style={{ paddingHorizontal: '5%' }}>
                {/* The theme control is standalone: OptionsComponents is only for navigation rows. */}
                <View style={[styles.themeSection, NewStyles.shadow, { backgroundColor: colors.surface, paddingHorizontal: 10 }, NewStyles.rowWrapper]}>
                    <Text style={[NewStyles.text10, styles.themeLabel]}>{t(themeMode === 'dark' ? 'Dark' : 'Light')}</Text>
                    <ThemeModeSwitch
                        value={themeMode === 'dark'}
                        onValueChange={(enabled) => setThemeMode(enabled ? 'dark' : 'light')}
                        accessibilityLabel={t('Appearance')}
                    />
                </View>
                <OptionsComponents txt={t('Change Password')} icon={'lock-open'} onPress={() => {
                    navigation.navigate('ChangePassword')
                }} />
                <OptionsComponents txt={t('Device information')} icon={'phone-portrait'} onPress={() => {
                    navigation.navigate('ActiveDevice')
                }} />
                <OptionsComponents txt={t('Log Out')} icon={'log-out'} onPress={() => {
                    setModal(true)
                }} />
            </View>
            <View>
                <ConfirmationModal confirmationModal={modal} setConfirmationModal={setModal} title={t('Log Out')} action={() => {
                    setModal(false);
                    logout()
                }} message={t('Are you sure you want to log out?')} />
            </View>
        </View>
    )
}

export default Settings

const styles = StyleSheet.create({
    themeSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        marginTop: 12,
        marginBottom: 12,
        borderRadius: 15,

    },
    themeHeading: {
        marginBottom: 14,
        textAlign: 'center',
    },
    themeLabel: {
        marginTop: 10,
        textAlign: 'center',
    },
})