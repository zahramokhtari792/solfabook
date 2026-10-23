import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import { TouchableOpacity } from 'react-native'
import { useNewStyles } from '../styles/NewStyles'
import { themeColor1 } from '../theme/Color'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../context/ThemeProvider';

const FileInfoItem = ({ onPress, title, value, textDecoration = true }) => {
    const { t } = useTranslation()
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();
    return (
        <View style={[NewStyles.rowWrapper, { width: '100%', marginTop: 20, paddingBottom: 20, borderBottomColor: themeColor1.bgColor(1), borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 10 }]}>
            <Text style={NewStyles.text10}>
                {t(title)}
            </Text>
            <TouchableOpacity onPress={onPress}>
                <Text style={[NewStyles.text10, textDecoration && { textDecorationStyle: 'solid', textDecorationLine: 'underline', textDecorationColor: colors.text }]}>
                    {value}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default FileInfoItem

const styles = StyleSheet.create({})