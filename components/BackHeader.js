import { StyleSheet, Text, View, TouchableOpacity, Pressable, Image } from 'react-native'
import React, { useMemo } from 'react'
import makeStyles, { deviceWidth, langIsRTL } from '../styles/NewStyles'
import { themeColor0, themeColor1, themeColor14, themeColor3, themeColor4, themeColor5 } from '../theme/Color'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BackArrowIcon from '../assets/svg/BackArrowIcon';
import { useTranslation } from 'react-i18next';
import { useSearchModal } from '../context/SearchProvider';
import SearchIcon from '../assets/svg/SearchIcon';

const BackHeader = ({ bgColor = 1, title, transparent, customBack, isCustom }) => {
    const navigation = useNavigation()
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const { showSearchModal } = useSearchModal();
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    return (
        <View style={{ backgroundColor: themeColor5.bgColor(1) }}>
            <View style={[{ height: 65, width: '100%', backgroundColor: themeColor5.bgColor(bgColor), paddingHorizontal: 15, borderBottomColor: themeColor0.bgColor(1), borderBottomWidth: StyleSheet.hairlineWidth, }, NewStyles.rowWrapper, NewStyles.center, transparent && { position: 'absolute', backgroundColor: themeColor4.bgColor(0), zIndex: 10000, marginTop: 0 },]}>
                <View style={[{gap:10}, NewStyles.row]}>
                    <Image source={require('../assets/images/solfabooklogo.png')} style={{ width: 60, height: 60 }} />
                    <Pressable style={{ paddingHorizontal: 10 }} onPress={() => {
                        showSearchModal()
                    }}>
                        <SearchIcon color={themeColor0.bgColor(1)} />
                    </Pressable>
                </View>
                <View style={{ flex: 1, alignItems: langIsRTL(lang) ? 'flex-start' : 'flex-end', }}>
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