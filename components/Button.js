import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import React, { useMemo } from 'react';

import makeStyles from '../styles/NewStyles';
import { themeColor0, themeColor4 } from '../theme/Color';
import { useTranslation } from 'react-i18next';

export default function Button({ title, onPress, loading, customStyle, textStyle }) {
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    return (
        <Pressable style={[styles.button, NewStyles.center, NewStyles.shadow, NewStyles.border8, customStyle]} disabled={loading} onPress={onPress}>
            {!loading && <Text style={[NewStyles.title4, textStyle]}>{title}</Text>}
            {loading && <ActivityIndicator color={themeColor4.bgColor(1)} size='small' />}
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