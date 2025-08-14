import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import React from 'react';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor4 } from '../theme/Color';

export default function Button({ title, onPress, loading, customStyle, textStyle }) {
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