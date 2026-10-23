import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import React from 'react';

import { useNewStyles } from '../styles/NewStyles';
import { themeColor0 } from '../theme/Color';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../context/ThemeProvider';

export default function Button({ title, onPress, loading, customStyle, textStyle }) {
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();
    return (
        <Pressable style={[styles.button, NewStyles.center, NewStyles.shadow, NewStyles.border8, customStyle]} disabled={loading} onPress={onPress}>
            {!loading && <Text style={[NewStyles.title4, textStyle]}> {title} </Text>}
            {loading && <ActivityIndicator color={colors.onPrimary} size='small' />}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: themeColor0.bgColor(1),
        marginVertical: 20,
        height: 50
    },
})