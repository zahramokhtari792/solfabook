import { Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { Dropdown } from 'react-native-element-dropdown';
import { imageUri, uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';
import NewStyles, { deviceHeight } from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor12, themeColor2, themeColor3, themeColor4, themeColor5, themeColor6 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Button from '../../components/Button';
// import DatePickerModal from '../../components/DatePickerModal';
import { showToastOrAlert } from '../../helpers/Common';
import { ImageBackground } from 'react-native';

export default function Profile() {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const userToken = useSelector(state => state?.auth?.token);
    const user = useSelector(state => state.user?.data);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [birthDate, setBirthDate] = useState(user?.birth_date || '');
    const [datePickerModal, setDatePickerModal] = useState(false);
    const [gender, setGender] = useState(user?.gender || '');

    const upload = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });
        if (result.canceled) {
            return;
        }
        let formData = new FormData();
        let localUri = result.assets[0].uri;
        let filename = localUri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        formData.append('file[]', { uri: localUri, name: filename, type });
        setLoading(true)
        await axios
            .post(`${uri}/upload`, formData, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'multipart/form-data' }, })
            .then(response => {
                updateProfilePhotoPath(response.data)
            })
            .catch(error => {
                const message = error.response
                    ? error.response.status === 401
                        ? t('Unauthorized access!')
                        : t('An unexpected error occurred!')
                    : t('Network error!');
                showToastOrAlert(message);
            })
    }

    const updateProfilePhotoPath = async (profilePhotoPath) => {
        try {
            const response = await axios.post(`${uri}/updateProfilePhotoPath`, { profilePhotoPath: profilePhotoPath }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            if (response.status === 200) {
                const message = t('Your changes have been applied.');
                showToastOrAlert(message);
                dispatch(fetchUser(userToken));
            }
        } catch (error) {
            const message = error.response
                ? error.response.status === 401
                    ? t('Unauthorized access!')
                    : t('An unexpected error occurred!')
                : t('Network error!');
            showToastOrAlert(message);
        } finally {
            dispatch(fetchUser(userToken));
            setLoading(false);
            setRefreshing(false);
        }
    }

    const removeProfilePhotoPath = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${uri}/removeProfilePhotoPath`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            if (response.status === 200) {
                const message = t('Your changes have been applied.')
                showToastOrAlert(message);
                dispatch(fetchUser(userToken));
            }
        } catch (error) {
            const message = error.response
                ? error.response.status === 401
                    ? t('Unauthorized access!')
                    : t('An unexpected error occurred!')
                : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const changeInformation = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/changeInformation`, { name: name, email: email, gender: gender }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            if (response.status === 200) {
                const message = t('Your changes have been applied.')
                showToastOrAlert(message);
            }
        } catch (error) {
            const message = error.response
                ? error.response.status === 401
                    ? t('Unauthorized access!')
                    : t('An unexpected error occurred!')
                : t('Network error!');
            showToastOrAlert(message);
        } finally {
            dispatch(fetchUser(userToken));
            setLoading(false);
            setRefreshing(false);
        }
    }

    return (
        <SafeAreaView style={NewStyles.container}>
            <CustomStatusBar />
            <ScrollView refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { dispatch(fetchUser(userToken)) }} />}>
                <ImageBackground style={[styles.imageBackground, NewStyles.center]} blurRadius={5} source={{ uri: `${imageUri}/${user?.profile_photo_path}` }} contentFit="cover" transition={1000}>
                    <Pressable onPress={() => { upload() }}>
                        {user?.profile_photo_path ? (<Image style={[styles.profileImage, NewStyles.border100]} source={{ uri: `${imageUri}/${user?.profile_photo_path}`, }} contentFit="cover" transition={1000} />) : (<View style={[styles.profileImage, NewStyles.border100, NewStyles.center]}><Text style={[styles.profileImageThumbnail]}>{user?.name?.[0]}</Text></View>)}
                        {user?.profile_photo_path && <Pressable style={{ position: 'absolute' }} onPress={() => { removeProfilePhotoPath() }}>
                            <Ionicons name="close-circle-sharp" size={30} color={themeColor6.bgColor(1)} />
                        </Pressable>}
                        {!user?.profile_photo_path && <View style={{ position: 'absolute' }} >
                            <Ionicons name="add-circle" size={30} color={themeColor0.bgColor(1)} />
                        </View>}
                    </Pressable>
                </ImageBackground>
                <View style={styles.wrapper}>
                    <Text style={NewStyles.text}>{t('You have entered with mobile number {{phone}}.', { phone: user?.phone })}</Text>
                    <Text style={NewStyles.text}>{t('Please enter your Full Name.')}</Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text, NewStyles.border10]} keyboardType='default' placeholderTextColor={themeColor0.bgColor(1)} placeholder={`${t('Full Name')}`} value={name} onChangeText={(text) => setName(text)} />
                    <Text style={NewStyles.text}>{t('Please enter your Email Address.')}</Text>
                    <TextInput style={[NewStyles.textInput, NewStyles.text, NewStyles.border10]} keyboardType='default' placeholderTextColor={themeColor0.bgColor(1)} placeholder={`${t('Email Address')}`} value={email} onChangeText={(text) => setEmail(text)} />
                    <Text style={NewStyles.text}>لطفا جنسیت خود را مشخص کنید</Text>
                    <Dropdown
                        style={[NewStyles.textInput, NewStyles.border10, { marginVertical: 10 }]}
                        placeholderStyle={styles.textStyle}
                        selectedTextStyle={styles.textStyle}
                        itemTextStyle={styles.textStyle}
                        containerStyle={styles.containerStyle}
                        itemContainerStyle={styles.itemContainerStyle}
                        activeColor={themeColor0.bgColor(0.2)}
                        data={[{ 'title': 'زن', id: 'female' }, { title: 'مرد', id: 'male' }]}
                        inputSearchStyle={styles.inputSearchStyle}
                        autoScroll={false}
                        labelField="title"
                        valueField="id"
                        placeholder={"انتخاب کنید"}
                        showsVerticalScrollIndicator={false}
                        renderRightIcon={() => (
                            <Ionicons name='search-outline' size={24} color={themeColor0.bgColor(1)} />
                        )}

                        renderLeftIcon={() => (
                            <MaterialIcons name="keyboard-arrow-down" size={24} color={themeColor0.bgColor(1)} />
                        )}
                        value={gender}
                        onChange={(item) => { setGender(item?.id) }}
                    />
                    <Button title={`${t('Change Information')}`} loading={loading} onPress={() => { changeInformation() }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    imageBackground: {
        width: '100%',
        height: deviceHeight * 0.35,
        backgroundColor: themeColor0.bgColor(0.1)
    },
    profileImage: {
        height: 100,
        width: 100,
        backgroundColor: themeColor3.bgColor(1),
    },
    inputSearchStyle: {
        fontSize: 14,
        fontFamily: 'VazirLight',
        textAlign: 'right',
        color: themeColor0.bgColor(1),
        paddingHorizontal: 10,
        height: 50,
        borderWidth: 0,
        // backgroundColor: themeColor4.bgColor(0.1),
        borderRadius: 8,
    },
    itemContainerStyle: {
        backgroundColor: themeColor4.bgColor(0.1),
        borderRadius: 8,
        margin: 2,
        borderCurve: 'continuous',
        // overflow: 'hidden',
    },
    textStyle: {
        fontSize: 14,
        fontFamily: 'VazirLight',
        textAlign: 'right',
        color: themeColor0.bgColor(1),
        paddingRight: 10,
    },
    containerStyle: {
        borderRadius: 8,
        margin: 0,
        padding: 0,
        borderCurve: 'continuous',
        // overflow: 'hidden',
        borderColor: themeColor5.bgColor(1),
        backgroundColor: themeColor5.bgColor(1)
    },
    profileImageThumbnail: {
        fontFamily: 'VazirBold',
        fontSize: 40,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: themeColor4.bgColor(1),
    },
    wrapper: {
        paddingHorizontal: '5%',
        gap: 10,
        paddingVertical: 20
    }
})