import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as Linking from "expo-linking";
import { themeColor0, themeColor1, themeColor10, themeColor4 } from '../theme/Color';
import { useNewStyles, langIsRTL } from '../styles/NewStyles';
import { useAppTheme } from '../context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import TransparentButton from './TransparentButton';
import { uri } from '../services/URL';
import { fetchUser } from '../slices/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { showToastOrAlert } from '../helpers/Common';

const Wallet = ({ modal, setModal }) => {

    const { t } = useTranslation()
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();
    const userToken = useSelector(state => state.auth?.token)
    const user = useSelector(state => state.user?.data)
    const dispatch = useDispatch()
    const [items] = useState([{ id: 1, name: t("30,000 T"), price: '30000' }, { id: 2, name: t("40,000 T"), price: '40000' }, { id: 3, name: t("50,000 T"), price: '50000' }, { id: 4, name: t("100,000 T"), price: '100000' }, { id: 5, name: t("150,000 T"), price: '150000' }]);
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false)

    const item = ({ item }) => {
        return (
            <TouchableOpacity style={[styles.price, price == item.price && { backgroundColor: themeColor0.bgColor(1), borderColor: themeColor0.bgColor(1) }]} onPress={() => setPrice(item.price)}>
                <Text style={[NewStyles.text1, price == item.price && { color: themeColor4.bgColor(1) }]}>{item.name}</Text>
            </TouchableOpacity >
        );
    }
    const redirectUrl = Linking.createURL("/?");


    const increaseWallet = async () => {
        try {
            let result = await Linking.openURL(`${uri}/wallet/increase?linkingUri=${redirectUrl}&amount=${price}&userId=${user?.id}`);
            let redirectData;
            if (result.url) {
                redirectData = Linking.parse(result.url);
            }
        } catch (error) {
            setLoading(false);
        } finally {

        }
    }

    const handleRedirect = (event) => {
        const { queryParams } = Linking.parse(event?.url);

        if (queryParams?.status == 'success') {
            dispatch(fetchUser(userToken))
            showToastOrAlert(t('Your wallet has been successfully topped up.'))
            setLoading(false);
        } else if (queryParams?.status == 'failed') {
            showToastOrAlert(t('The payment encountered an error.'))
            setLoading(false);
        }
        setModal(false)
    };

    useEffect(() => {
        const listener = Linking.addEventListener('url', handleRedirect);

        return () => {
            listener.remove(); // موقع unmount شدن کامپوننت، لیسنر حذف میشه
        };
    }, []);
    return (
        <Modal animationType='slide' visible={modal} transparent={true} onRequestClose={() => {
            setModal(false)
        }}>

            <TouchableWithoutFeedback onPress={() => { if (Platform.OS !== 'web') { setModal(false); } }}>
                <KeyboardAvoidingView behavior={Platform.OS == "ios" ? 'height' : 'height'} keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0} style={{ flex: 1, backgroundColor: themeColor10.bgColor(0.2), }}>
                    <View style={[styles.modal, { backgroundColor: colors.surface }, NewStyles.shadow]}>
                        <Text style={[NewStyles.title, { textAlign: 'center' }]}>
                            {t('Recharge wallet')}
                        </Text>
                        <View style={{ height: 80, paddingVertical: 20, }}>
                            <FlatList horizontal inverted={langIsRTL(lang)} style={{}} showsHorizontalScrollIndicator={false} key={items.id} keyExtractor={items.id} data={items} renderItem={item} />
                        </View>

                        <Text style={NewStyles.text10}>
                            {t('Enter your desired amount.')}
                        </Text>
                        <TextInput style={[NewStyles.textInput, NewStyles.text, NewStyles.border10, NewStyles.shadow, { width: '90%', fontFamily: langIsRTL(lang) ? 'VazirBold' : 'VazirThin', }, Platform.OS === 'web' && NewStyles.noZoomInput]} keyboardType='phone-pad' placeholder={`10,000 ${t("currency unit")}`} placeholderTextColor={colors.textMuted} value={price?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} onChangeText={(text) => setPrice(text?.replace(/,/g, ""))} />

                        <View style={{ flexDirection: 'row', width: '70%', justifyContent: 'space-between' }}>
                            <View style={{ width: '48%' }}>
                                <Button customStyle={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: themeColor0.bgColor(1) }} textStyle={{ color: colors.primaryText }} title={t("Cancel")} onPress={() => { setModal(false) }} />
                            </View>
                            <View style={{ width: '48%' }}>
                                <Button title={t("Payment")} onPress={async () => {
                                    if (price >= 10000) {
                                        increaseWallet()
                                    } else {
                                        showToastOrAlert(t('The minimum allowed amount is 10,000 Tomans.'))
                                    }
                                }
                                } />
                            </View>
                        </View>

                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Modal >
    )
}

export default Wallet

const styles = StyleSheet.create({

    price: {
        marginHorizontal: 5,
        paddingVertical: 5,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: themeColor1.bgColor(1),
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


    modal: {
        height: '35%',
        minHeight: 300,
        width: '100%',
        backgroundColor: themeColor4.bgColor(1),
        alignItems: "center",
        justifyContent: 'space-evenly',
        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },

    textinput: {
        width: '90%',
        height: 50,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        textAlign: 'right',
        fontSize: 14,

        color: '#000',
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.16,
        shadowRadius: 1.51,
        elevation: 10,
    },

})