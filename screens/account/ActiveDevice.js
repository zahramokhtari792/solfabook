import { StyleSheet, Text, View } from 'react-native'
import React, { useLayoutEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNewStyles } from '../../styles/NewStyles';
import { useAppTheme } from '../../context/ThemeProvider';
import { formatDate } from '../../helpers/Common'
import { useTranslation } from 'react-i18next'

const ActiveDevice = ({ navigation }) => {
    const user = useSelector(state => state.user?.data);
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();

    // The native form-sheet background is configured by the navigator.
    // Keep its content surface in sync with the selected theme.
    useLayoutEffect(() => {
        navigation?.setOptions?.({ contentStyle: { backgroundColor: colors.surface } });
    }, [navigation, colors.surface]);

    return (
        <View style={{ padding: '5%', gap: 10 }}>
            <View style={[NewStyles.row, { gap: 5, justifyContent: 'flex-end' }]}>
                <Text style={NewStyles.text10}>{user?.active_device?.device_id}</Text>
                <Text style={NewStyles.title10}>Device ID:</Text>
            </View>
            <View style={[NewStyles.row, { gap: 5, justifyContent: 'flex-end' }]}>
                <Text style={NewStyles.text10}>{formatDate(user?.active_device?.created_at)}</Text>
            </View>
        </View>
    )
}

export default ActiveDevice

const styles = StyleSheet.create({})