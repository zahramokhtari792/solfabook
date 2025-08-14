import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import NewStyles from '../styles/NewStyles'
import { themeColor1, themeColor10 } from '../theme/Color'
import { useTranslation } from 'react-i18next'

const FileInfoItem = ({ onPress, title, value, textDecoration=true }) => {
    const { t } = useTranslation()
    return (
        <View style={[NewStyles.rowWrapper, { width: '100%', marginTop: 20, paddingBottom: 20, borderBottomColor: themeColor1.bgColor(1), borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 10 }]}>
            <Text style={NewStyles.text10}>
                {t(title)}
            </Text>
            <TouchableOpacity onPress={onPress}>
                <Text style={[NewStyles.text10, textDecoration && { textDecorationStyle: 'solid', textDecorationLine: 'underline', textDecorationColor: themeColor10.bgColor(1) }]}>
                    {value}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default FileInfoItem

const styles = StyleSheet.create({})