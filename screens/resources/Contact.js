import { Linking, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import NewStyles from '../../styles/NewStyles'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { themeColor0, themeColor5 } from '../../theme/Color'
import Button from '../../components/Button'
import axios from 'axios'
import { uri } from '../../services/URL'
import { handleError, showToastOrAlert, validateEmail, validatePhone } from '../../helpers/Common'
import { useTranslation } from 'react-i18next'
import Svg, { Path } from 'react-native-svg'
import Loader from '../../components/Loader';

const Contact = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(true);
    const [title, setTitle] = useState();
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [phone, setPhone] = useState();
    const [message, setMessage] = useState();
    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/resources`);
            setData(response?.data?.contacts);
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false);
            setLoader(false);
        }
    };
    

    const submitForm = () => {
        setLoading(true)
        axios.post(`${uri}/contactUsSubmit`, { name: name, phone: phone, email: email, title: title, description: message })
            .then((res) => {
                showToastOrAlert('پیام شما با موفقیت ثبت شد.')
                setTitle()
                setName()
                setEmail()
                setPhone()
                setMessage()
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(()=>{
        fetchData()
    },[])

    if(loader){
        return(
            <Loader/>
        )
    }
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <KeyboardAwareScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
                <View style={[NewStyles.center]}>
                    <Text style={[NewStyles.title, { paddingVertical: 20, fontSize: 20 }]}>با ما در تماس باشید</Text>
                    <View style={{ gap: 10, width: '100%', paddingHorizontal: '5%' }}>
                        <Text style={NewStyles.text}>{t("Message subject")} <Text>*</Text></Text>
                        <TextInput style={[NewStyles.textInput, NewStyles.text10, { borderColor: themeColor0.bgColor(1), borderWidth: 1 }, NewStyles.border10]} placeholder={`${t("Message subject")}`} value={title} onChangeText={(text) => setTitle(text)} maxLength={191} />
                        <Text style={NewStyles.text}>{t("Name and surname")} <Text>*</Text></Text>
                        <TextInput style={[NewStyles.textInput, NewStyles.text10, { borderColor: themeColor0.bgColor(1), borderWidth: 1 }, NewStyles.border10]} placeholder={`${t("Name and surname")}`} value={name} onChangeText={(text) => setName(text)} maxLength={191} />
                        <Text style={NewStyles.text}>{t("Email")} <Text>*</Text></Text>
                        <TextInput style={[NewStyles.textInput, NewStyles.text10, { borderColor: themeColor0.bgColor(1), borderWidth: 1 }, NewStyles.border10]} placeholder={t("Email")} value={email} onChangeText={(text) => setEmail(text)} maxLength={191} />
                        <Text style={NewStyles.text}>{t("Phone Number")} <Text>*</Text></Text>
                        <TextInput style={[NewStyles.textInput, NewStyles.text10, { borderColor: themeColor0.bgColor(1), borderWidth: 1 }, NewStyles.border10]} placeholder={t("Phone Number")} value={phone} onChangeText={(text) => setPhone(text)} maxLength={191} />
                        <Text style={NewStyles.text}>{t("Message")} <Text>*</Text></Text>
                        <TextInput style={[NewStyles.textInput, { height: 150, textAlignVertical: 'top', paddingTop: 10, borderColor: themeColor0.bgColor(1), borderWidth: 1 }, NewStyles.text10, NewStyles.border10]} multiline={true} maxLength={191} placeholder={t("Message")} value={message} onChangeText={(text) => setMessage(text)} />
                    </View>
                    <View style={{ width: '100%', paddingHorizontal: '5%' }}>
                        <Button loading={loading} title={t('Send Message')} onPress={() => {
                            if (name && title && email && phone && message) {
                                if (validateEmail(email) && validatePhone(phone)) {
                                    submitForm()
                                } else if (!validateEmail(email)) {
                                    showToastOrAlert('ایمیل وارد شده نامعتبر است.')
                                } else if (!validatePhone(phone)) {
                                    showToastOrAlert('شماره تلفن وارد شده نامعتبر است.')
                                }
                            } else {
                                showToastOrAlert('تکمیل تمامی فیلدها ضروری است.')
                            }
                        }} />
                    </View>
                    <Pressable style={[{ backgroundColor: themeColor5.bgColor(1), height: 50, width: '90%', marginBottom: 20, borderColor: themeColor0.bgColor(1), borderWidth: 1 }, NewStyles.shadow, NewStyles.center, NewStyles.border10]} onPress={() => { Linking.openURL(`${data?.link}`)}}>

                        <View style={[{ borderColor: themeColor0.bgColor(1), gap: 5 }, NewStyles.row]}>

                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <Path d="M12 2C6.486 2 2 6.486 2 12V16.143C2 17.167 2.897 18 4 18H5C5.26522 18 5.51957 17.8946 5.70711 17.7071C5.89464 17.5196 6 17.2652 6 17V11.857C6 11.5918 5.89464 11.3374 5.70711 11.1499C5.51957 10.9624 5.26522 10.857 5 10.857H4.092C4.648 6.987 7.978 4 12 4C16.022 4 19.352 6.987 19.908 10.857H19C18.7348 10.857 18.4804 10.9624 18.2929 11.1499C18.1054 11.3374 18 11.5918 18 11.857V18C18 19.103 17.103 20 16 20H14V19H10V22H16C18.206 22 20 20.206 20 18C21.103 18 22 17.167 22 16.143V12C22 6.486 17.514 2 12 2Z" fill={themeColor0.bgColor(1)} />
                            </Svg>
                            <Text style={NewStyles.text10}>
                                مشکلی پیش آمده؟ با پشتیبانی تماس بگیرید.
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default Contact

const styles = StyleSheet.create({})