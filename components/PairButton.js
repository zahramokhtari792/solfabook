import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import React from 'react';

import { useNewStyles } from '../styles/NewStyles';
import { themeColor0, themeColor3 } from '../theme/Color';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../context/ThemeProvider';

export default function PairButton({ text1, text2, onPress1, onPress2, loading1, loading2 }) {

    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();
    return (
        <View style={NewStyles.row}>
            {text1 && <Pressable style={[styles.button1, NewStyles.center, NewStyles.border100]} disabled={loading1} onPress={onPress1}>
                {!loading1 && <Text style={NewStyles.text4}>{text1}</Text>}
                {loading1 && <ActivityIndicator color={colors.onPrimary} size='small' />}
            </Pressable>}
            {text2 && <Pressable style={[styles.button2, NewStyles.center, NewStyles.border100]} disabled={loading2} onPress={onPress2}>
                {!loading2 && <Text style={NewStyles.text4}>{text2}</Text>}
                {loading2 && <ActivityIndicator color={themeColor3.bgColor(1)} size='small' />}
            </Pressable>}
        </View>
    )
}

const styles = StyleSheet.create({
    button1: {
        backgroundColor: themeColor0.bgColor(1),
        paddingHorizontal: 20,
        paddingVertical: 7,
        minWidth: 120
    },

    button2: {
        backgroundColor: themeColor3.bgColor(1),
        marginHorizontal: 5,
        paddingHorizontal: 15,
        paddingVertical: 7,
        minWidth: 80
    },
})