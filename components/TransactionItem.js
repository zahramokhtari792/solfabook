import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor5 } from '../theme/Color';
import { formatDateTime, formatPrice } from '../helpers/Common';

export default function TransactionItem({ item }) {

    const { t } = useTranslation();

    const renderRow = (label, value, textStyle = NewStyles.text10) =>
        value ? (
            <View style={NewStyles.rowWrapper}>
                <Text style={NewStyles.text3}>{t(label)}</Text>
                <Text style={textStyle}>{t(value)}</Text>
            </View>
        ) : null;

    const handleType = () => {
        if (item?.type == 1) {
            return "wallet recharge";
        } else if (item?.type == 2) {
            return 'Buying files from wallet';
        } else if (item?.type == 3) {
            return 'Purchase files from the payment gateway';
        } else if (item?.type == 4) {
            return 'Withdraw';
        } else if (item?.type == 5) {
            return 'Pay for the order through the payment gateway';
        } else if (item?.type == 6) {
            return 'Pay for the order from your wallet';
        }
    } 

    return (
        <View style={[styles.itemWrapper, NewStyles.shadow, NewStyles.border10]}>
            {renderRow(`${t('Transaction ID')}: ${item?.id}`, formatDateTime(item?.created_at))}
            {renderRow(t('Status'), item?.status == 100 ? 'Successful' : 'Unsuccessful', item?.status == 100 ? NewStyles.text7 : NewStyles.text6)}
            {item?.order_id && renderRow(t('Pay for the order with ID'), `${item?.order_id}`)}
            {(item?.file_id && item?.file?.title) && renderRow(t('File name'), `${item?.file?.title}`)}
            {renderRow('Amount', `${formatPrice(item?.price)} ${t('T')}`)}
            {renderRow('Description', ` `)}
            {renderRow(``, `${handleType()}`, [NewStyles.text10, { flex: 1 }])}
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