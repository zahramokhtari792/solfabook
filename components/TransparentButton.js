import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import React from 'react';

import { useNewStyles } from '../styles/NewStyles';
import { themeColor0 } from '../theme/Color';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../context/ThemeProvider';

export default function TransparentButton({ title, onPress, loading, color }) {

    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();
    return (
        <Pressable style={[styles.button, NewStyles.center]} disabled={loading} onPress={onPress}>
            {!loading && <Text style={[NewStyles.text10, { color: color ?? colors.text }]}> {title} </Text>}
            {loading && <ActivityIndicator color={themeColor0.bgColor(1)} size='small' />}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        // marginVertical: 10,
        // height: 40
    },
})