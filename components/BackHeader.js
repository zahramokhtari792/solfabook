import { StyleSheet, Text, View, TouchableOpacity, Pressable, Image } from 'react-native'
import React from 'react'
import NewStyles, { deviceWidth } from '../styles/NewStyles'
import { themeColor0, themeColor1, themeColor14, themeColor3, themeColor4, themeColor5 } from '../theme/Color'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BackArrowIcon from '../assets/svg/BackArrowIcon';

const BackHeader = ({ bgColor = 1, title, transparent, customBack, isCustom }) => {
    const navigation = useNavigation()
    return (
        <View style={{ backgroundColor: themeColor5.bgColor(1) }}>
            <View style={[{ height: 65, width: '100%', backgroundColor: themeColor5.bgColor(bgColor), paddingHorizontal: 15, borderBottomColor: themeColor0.bgColor(1), borderBottomWidth: StyleSheet.hairlineWidth, }, NewStyles.rowWrapper, NewStyles.center, transparent && { position: 'absolute', backgroundColor: themeColor4.bgColor(0), zIndex: 10000, marginTop: 0 },]}>
                <View style={{}}>
                    <Image source={require('../assets/images/solfabooklogo.png')} style={{ width: 60, height: 60 }} />
                </View>
                <View style={{ flex: 1, alignItems: 'flex-start', }}>
                    <TouchableOpacity style={[NewStyles.border10, NewStyles.center, { height: 35, width: 35, }]} onPress={() => {
                        if (isCustom) {
                            customBack()
                        } else {

                            navigation.goBack()
                        }
                    }}>
                        <BackArrowIcon color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>

    )
}

export default BackHeader

const styles = StyleSheet.create({

})