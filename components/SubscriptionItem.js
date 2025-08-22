import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { cleanText, formatPrice } from '../helpers/Common';
import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor1, themeColor10, themeColor4 } from '../theme/Color';
import Button from './Button';

export default function SubscriptionItem({ item, onPress }) {

    const { t } = useTranslation()
    const locale = useSelector(state => state?.locale?.data);

    return (
        <Pressable style={[styles.itemWrapper, NewStyles.shadow, NewStyles.border10]} onPress={() => { }}>
            <View style={[styles.label, NewStyles.center, { backgroundColor: themeColor1.bgColor(0.3) }]}>
                <Text style={NewStyles.text} numberOfLines={1}>{t('For {{num}} month', { num: item?.month_number })}</Text>
            </View>
            <View style={[{ gap: 10, marginTop: '5%' }, NewStyles.center]}>
                <Text style={[NewStyles.title10, { fontSize: 20 }]}>{item?.title}</Text>
            </View>
            <View style={[NewStyles.center,]}>
                <Text style={[NewStyles.title10, { fontSize: 20 }]}>{(item?.discounted_price && item?.discounted_price > 0) ? formatPrice(item?.discounted_price) : item?.discounted_price == 0 ? t('Free') : formatPrice(item?.price) + ' ' +t('currency unit')} <Text style={[NewStyles.text10, { fontSize: 14 }]}></Text></Text>
                {(item?.discounted_price && item?.discounted_price > 0) && <Text style={[NewStyles.title3, NewStyles.discountText]}>{formatPrice((item?.price))} {t('currency unit')}</Text>}
                <Text style={[NewStyles.text10, { textAlign: 'center', marginTop: 10 }]}>{cleanText(item?.des)}</Text>
                <View style={[NewStyles.row, { justifyContent: 'space-between' }]}>
                    <View style={{ flex: 1, marginLeft: 2 }}  >
                        <Button title={t('Buy Now')} onPress={onPress} />
                    </View>

                </View>
            </View>

        </Pressable>
    )
}

const styles = StyleSheet.create({
    itemWrapper: {
        width: deviceWidth * 0.9,
        backgroundColor: themeColor4.bgColor(1),
        paddingHorizontal: '5%',
        paddingVertical: 15,
        gap: 10
    },
    label: {
        position: 'absolute',
        left: 0,
        top: 0,
        paddingHorizontal: '5%',
        paddingVertical: '2%',
        borderBottomRightRadius: 100,
        borderTopLeftRadius: 10
    }
})