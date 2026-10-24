import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { themeColor1 } from '../theme/Color';
import { useNewStyles, langIsRTL } from '../styles/NewStyles';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../context/ThemeProvider';


const OptionsComponents = ({ icon, txt, onPress, selected = false }) => {
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    const { colors, isDark } = useAppTheme();
    const accentColor = isDark ? colors.primaryText : colors.primary;
    return (
        <TouchableOpacity style={[styles.items, { backgroundColor: colors.optionSurface }, NewStyles.shadow, NewStyles.rowWrapper]} onPress={onPress}>
            <View style={NewStyles.row}>
                <View style={[NewStyles.center, { backgroundColor: themeColor1.bgColor(0.2), padding: 7 }, NewStyles.border5]}>
                    <Ionicons name={icon} color={accentColor} size={18} />
                </View>
                <Text style={[NewStyles.text10, { paddingHorizontal: 10, }]}>{txt}</Text>
            </View>
            <Ionicons name={selected ? 'checkmark-circle' : (langIsRTL(lang) ? 'chevron-back' : 'chevron-forward')} color={accentColor} size={20} />
        </TouchableOpacity>

    )
}

export default OptionsComponents

const styles = StyleSheet.create({
    items: {
        height: 50,
        paddingHorizontal: 15,
        marginVertical: 10,
        borderRadius: 15,
        alignItems: 'center',
    },
})