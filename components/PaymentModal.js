import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React from 'react'
import Button from './Button';
import { themeColor0, themeColor4 } from '../theme/Color';
import { Ionicons } from '@expo/vector-icons';
import NewStyles from '../styles/NewStyles';
import { useSelector } from 'react-redux';
import { formatPrice } from '../helpers/Common';
import { useTranslation } from 'react-i18next';


const PaymentModal = ({ modal, setModal, payment, wallet }) => {
    const user = useSelector(state => state.user?.data);
    const { t } = useTranslation()
    return (
        <Modal animationType='slide' visible={modal} transparent={true}>

            <TouchableWithoutFeedback onPress={() => { setModal(false); }}>
                <View style={{ height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <View style={styles.modal}>
                        <Text style={[NewStyles.title,{textAlign:'center'}]}>
                            {t("Payment")}
                        </Text>
                        <View style={[NewStyles.row,{gap:10}]}>
                            <View style={[{ backgroundColor: themeColor0.bgColor(0.3), paddingVertical: 7, paddingHorizontal: 8, borderRadius: 6 }, NewStyles.center]}>
                                <Ionicons name='wallet' color={themeColor0.bgColor(1)} size={25} />
                            </View>
                            <Text style={[NewStyles.title10]}>{t("Wallet balance")}: {formatPrice(user?.wallet)} {t('currency')}</Text>
                        </View>
                        <View style={[NewStyles.rowWrapper, { width: '90%' }]}>

                            <View style={{ width: '48%', }}>
                                <Button onPress={wallet} title={'پرداخت از کیف پول'} />
                            </View>

                            <View style={{ width: '48%', }}>
                                <Button onPress={payment} customStyle={{ borderWidth: 1, borderColor: themeColor0.bgColor(1), backgroundColor: themeColor4.bgColor(1) }} textStyle={{ color: themeColor0.bgColor(1) }} title={'پرداخت از درگاه'} />
                            </View>

                        </View>

                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default PaymentModal

const styles = StyleSheet.create({

    price: {
        marginHorizontal: 5,
        paddingVertical: 5,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#544FA2',
        borderWidth: 1,
        borderRadius: 25
    }
    ,

    flatListItem: {
        height: 60,
        paddingHorizontal: 10,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',

        elevation: 2,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { x: 2, y: -2 },
        overflow: 'hidden',
    },

    flatListItemContainer: {
        flex: 1,
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 10,
        // flexWrap: 'nowrap',
    },

    btn1: {
        width: '48%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderColor: 'black',
        borderWidth: 1,
    },

    btn2: {
        width: '48%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'black',

        elevation: 2,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { x: 2, y: -2 },
        overflow: 'hidden',
    },

    modal: {
        height: '28%',
        width: '100%',
        backgroundColor: '#fff',
        alignItems: "center",
        justifyContent: 'space-evenly',
        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,

        elevation: 10,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { x: 0, y: 10 },
        overflow: 'hidden',
    },

    textinput: {
        width: '90%',
        height: 50,
        paddingRight: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        textAlign: 'right',
        fontSize: 14,
        fontWeight: '600',
        color: '#544FA2',

        elevation: 2,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { x: 2, y: -2 },
        overflow: 'hidden',
    },

})