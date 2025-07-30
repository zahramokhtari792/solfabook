import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import NewStyles from '../../styles/NewStyles'
import { themeColor1, themeColor10, themeColor3, themeColor4, themeColor5 } from '../../theme/Color'
import Button from '../../components/Button'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { uri } from '../../services/URL'
import { handleError, showToastOrAlert } from '../../helpers/Common'
import { fetchUser } from '../../slices/userSlice'
import CustomStatusBar from '../../components/CustomStatusBar'
import BackHeader from './../../components/BackHeader';

const BankInfo = ({ navigation }) => {
    const userToken = useSelector(state => state?.auth?.token);
    const user = useSelector(state => state?.user?.data);
    const [cardNumber, setCardNumber] = useState(user?.card_no)
    const [cardName, setCardName] = useState(user?.account_name)
    const [bankName, setBankName] = useState(user?.bank_name)
    const [sheba, setSheba] = useState(user?.iban)
    const [loading, setLoading] = useState()
    const dispatch = useDispatch()
    const updateInfo = () => {
        setLoading(true)
        axios.post(`${uri}/changeBankInformation`, {
            card_no: cardNumber,
            iban: sheba,
            account_name: cardName,
            bank_name:bankName
        }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } }).then((res) => {
            dispatch(fetchUser(userToken))
            setLoading(false);
            navigation.goBack()

            showToastOrAlert('اطلاعات بانکی شما با موفقیت ویرایش شد')
        }).catch(err => {
            handleError(err)
        }).finally(() => {
            setLoading(false)
        })
    }


    return (
        <SafeAreaView style={NewStyles.container}>
            <CustomStatusBar/>
            <BackHeader title={'اطلاعات بانکی'} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                style={{}}
            >
                <ScrollView>
                    <View style={{ borderRadius: 5, width: '90%', alignSelf: 'center', alignItems: 'center', justifyContent: 'space-evenly', padding: 10, gap: 10, paddingVertical: 20 }}>
                        <View style={{ width: '100%', }}>
                            <Text style={[NewStyles.text, { marginBottom: 5 }]}>شماره کارت</Text>
                            <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text1]} placeholderTextColor={themeColor3.bgColor(0.4)} placeholder='شماره کارت' keyboardType='number-pad' maxLength={30} value={cardNumber} onChangeText={(p) => { setCardNumber(p) }} />
                        </View>
                        <View style={{ width: '100%', }}>
                            <Text style={[NewStyles.text, { marginBottom: 5 }]}>نام صاحب کارت</Text>
                            <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text1]} placeholderTextColor={themeColor3.bgColor(0.4)} placeholder='نام صاحب کارت' maxLength={30} value={cardName} onChangeText={(p) => { setCardName(p) }} />
                        </View>
                        <View style={{ width: '100%', }}>
                            <Text style={[NewStyles.text, { marginBottom: 5 }]}>نام بانک افتتاح کننده حساب</Text>
                            <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text1]} placeholderTextColor={themeColor3.bgColor(0.4)} placeholder='نام صاحب کارت' maxLength={30} value={bankName} onChangeText={(p) => { setBankName(p) }} />
                        </View>

                        <View style={{ width: '100%', }}>
                            <Text style={[NewStyles.text, { marginBottom: 5 }]}>شماره شبا</Text>
                            <TextInput style={[NewStyles.textInput, NewStyles.border10, NewStyles.text1]} placeholderTextColor={themeColor3.bgColor(0.4)} placeholder='شماره شبا' maxLength={30} value={sheba} onChangeText={(p) => { setSheba(p) }} />
                        </View>


                        <View style={{ width: '90%' }}>
                            <Button loading={loading} title={'ثبت اطلاعات'} onPress={() => {
                                updateInfo()
                            }} />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default BankInfo

const styles = StyleSheet.create({})