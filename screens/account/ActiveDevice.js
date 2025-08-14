import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux'
import NewStyles from '../../styles/NewStyles'
import { formatDate } from '../../helpers/Common'
import { useTranslation } from 'react-i18next'

const ActiveDevice = () => {
    const user = useSelector(state => state.user?.data);
    const { t } = useTranslation()
    return (
        <View style={{ padding: '5%', gap:10 }}>
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