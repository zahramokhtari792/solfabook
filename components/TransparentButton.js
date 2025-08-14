import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import React from 'react';

import NewStyles from '../styles/NewStyles';
import { themeColor0, themeColor10 } from '../theme/Color';

export default function TransparentButton({ title, onPress, loading, color = themeColor10.bgColor(1) }) {
    return (
        <Pressable style={[styles.button, NewStyles.center]} disabled={loading} onPress={onPress}>
            {!loading && <Text style={[NewStyles.text10, { color: color }]}>{title}</Text>}
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