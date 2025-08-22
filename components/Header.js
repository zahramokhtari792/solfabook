import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { themeColor0, themeColor4 } from '../theme/Color'
import UserIcon from '../assets/svg/UserIcon'
import NewStyles from '../styles/NewStyles'
import SearchIcon from '../assets/svg/SearchIcon'
import { useNavigation } from '@react-navigation/native'
import { useLoginModal } from '../context/LoginProvider'
import { useSelector } from 'react-redux'
import { useSearchModal } from '../context/SearchProvider'

const Header = () => {
    const navigation = useNavigation()
    const { showModal } = useLoginModal();
    const { showSearchModal } = useSearchModal();

    const user = useSelector(state => state.user?.data)
    const userToken = useSelector(state => state.auth?.token)
    return (
        <SafeAreaView style={[{ backgroundColor: themeColor4.bgColor(1), borderBottomWidth: StyleSheet.hairlineWidth, borderBlockColor: themeColor0.bgColor(1) }, NewStyles.rowWrapper]}>
            <Image source={require('../assets/images/solfabooklogo.png')} style={{ height: 70, width: 70, marginRight: 15 }} />
            <View style={[NewStyles.row, { flex: 1, justifyContent: 'flex-end', paddingLeft: 15 }]}>
                <Pressable onPress={()=>{
                    showSearchModal()
                }}>
                    <SearchIcon color={themeColor0.bgColor(1)} />
                </Pressable>

                <View style={{ height: 30, width: StyleSheet.hairlineWidth, backgroundColor: themeColor0.bgColor(1), marginHorizontal: 10 }} />
                <Pressable style={{}} onPress={() => {
                    if (user && userToken) {
                        navigation.navigate('Account')
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