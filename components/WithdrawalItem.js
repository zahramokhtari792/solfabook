import { View, StyleSheet, Text, Pressable, Linking } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../context/ThemeProvider';

import { useNewStyles, deviceWidth } from '../styles/NewStyles';
import { themeColor5 } from '../theme/Color';
import { formatDateTime, formatPrice } from '../helpers/Common';
import { imageUri, mainUri } from '../services/URL';

export default function WithdrawalItem({ item }) {

    const { t } = useTranslation();

    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();

    const renderRow = (label, value, textStyle = NewStyles.text10, action) =>
        value ? (
            <Pressable style={NewStyles.rowWrapper} onPress={action}>
                <Text style={NewStyles.text3}>{t(label)}</Text>
                <Text style={textStyle}>{t(value)}</Text>
            </Pressable>
        ) : null;

    return (
        <View style={[styles.itemWrapper, { backgroundColor: colors.surface }, NewStyles.shadow, NewStyles.border10]}>
            {renderRow(`ID: ${item?.id ?? '---'}`, formatDateTime(item?.created_at))}
            {renderRow('Amount', `${formatPrice(item?.price)} ${t('currency unit')}`)}
            {renderRow('IBAN', `${item?.iban}`)}
            {renderRow('Status', item?.status == 0 ? 'Pending' : item?.status == 1 ? "Approved" : item?.status == 3 ? 'Completed' : 'Rejected', item?.status == 0 ? NewStyles.text1 : item?.status == 1 ? NewStyles.text7 : item?.status == 3 ? NewStyles.text7 : NewStyles.text6)}
            {item?.file_path && renderRow('Payment receipt', `View`, NewStyles.text, () => Linking.openURL(`${imageUri}/${item?.file_path}`))}
            {item?.updated_at && item?.status == 3 && renderRow('End Date', formatDateTime(item?.updated_at))}
            {item?.response && renderRow('Description', ` `)}
            {item?.response && renderRow(``, `${item?.response}`, [NewStyles.text10, { flex: 1 }])}
        </View>
    )
}

const styles = StyleSheet.create({
    itemWrapper: {
        width: deviceWidth * 0.9,
        backgroundColor: themeColor5.bgColor(1),
        paddingHorizontal: '5%',
        paddingVertical: 15,
        gap: 10
    },
})