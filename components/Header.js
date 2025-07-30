import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { themeColor0, themeColor4 } from '../theme/Color'
import UserIcon from '../assets/svg/UserIcon'
import NewStyles from '../styles/NewStyles'
import SearchIcon from '../assets/svg/SearchIcon'

const Header = () => {
    return (
        <SafeAreaView style={[{ backgroundColor: themeColor4.bgColor(1), paddingHorizontal: 15 }, NewStyles.rowWrapper, NewStyles.shadow]}>
            <Image source={require('../assets/images/solfabooklogo.png')} style={{ height: 70, width: 70 }} />
            <View style={NewStyles.row}>
                <SearchIcon color={themeColor0.bgColor(1)} />
                <View style={{height:30, width:StyleSheet.hairlineWidth, backgroundColor:themeColor0.bgColor(1), marginHorizontal:10}} />
                <UserIcon color={themeColor0.bgColor(1)} />
            </View>

        </SafeAreaView>
    )
}

export default Header

const styles = StyleSheet.create({})