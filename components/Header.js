import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import { themeColor0, themeColor4 } from '../theme/Color'
import UserIcon from '../assets/svg/UserIcon'
import makeStyles from '../styles/NewStyles'
import SearchIcon from '../assets/svg/SearchIcon'
import { useNavigation } from '@react-navigation/native'
import { useLoginModal } from '../context/LoginProvider'
import { useSelector } from 'react-redux'
import { useSearchModal } from '../context/SearchProvider'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons';
import { useInternetStatus } from '../hooks/useInternetStatus'
import { showToastOrAlert } from '../helpers/Common'

const Header = () => {
    const navigation = useNavigation()
    const { showModal } = useLoginModal();
    const { showSearchModal } = useSearchModal();
    const isOnline = useInternetStatus();
    const user = useSelector(state => state.user?.data)
    const userToken = useSelector(state => state.auth?.token)

    const { i18n, t } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    return (
        <SafeAreaView style={[{ backgroundColor: themeColor4.bgColor(1), borderBottomWidth: StyleSheet.hairlineWidth, borderBlockColor: themeColor0.bgColor(1) }, NewStyles.rowWrapper]}>
            <Image source={require('../assets/images/solfabooklogo.png')} style={{ height: 70, width: 70, marginRight: 15 }} />
            <View style={[NewStyles.row, { flex: 1, justifyContent: 'flex-end' }]}>
                <Pressable style={{ paddingHorizontal: 10 }} onPress={() => {
                    if (isOnline) {
                        navigation.navigate('AlbumCart')
                    } else {
                        showToastOrAlert(t("No internet connection"))
                    }
                }}>
                    <Ionicons name={"cart-outline"} size={28} color={themeColor0.bgColor(1)} />
                </Pressable>
                <Pressable style={{ paddingHorizontal: 10 }} onPress={() => {
                    if (isOnline) {

                        showSearchModal()
                    } else {
                        showToastOrAlert(t("No internet connection"))
                    }
                }}>
                    <SearchIcon color={themeColor0.bgColor(1)} />
                </Pressable>

                <View style={{ height: 30, width: StyleSheet.hairlineWidth, backgroundColor: themeColor0.bgColor(1), marginHorizontal: 10 }} />
                <Pressable style={{ paddingHorizontal: 10 }} onPress={() => {
                    if (user && userToken && isOnline) {
                        navigation.navigate('Account')
                    } else if (!isOnline) {
                        showToastOrAlert(t("No internet connection"))
                    } else {

                        showModal()
                    }
                }}>
                    <UserIcon color={themeColor0.bgColor(1)} />
                </Pressable>
            </View>

        </SafeAreaView>
    )
}

export default Header

const styles = StyleSheet.create({})