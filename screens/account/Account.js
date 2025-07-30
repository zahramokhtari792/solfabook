import { View, Text, StyleSheet, SectionList, Pressable, Linking, Share } from 'react-native';
import React, { useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useHeaderHeight } from '@react-navigation/elements';

import { imageUri, uri } from '../../services/URL';
import { emptyUser } from '../../slices/userSlice';
import { removeToken } from '../../slices/authSlice';
import { appVersion, showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor1, themeColor4 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import ConfirmationModal from '../../components/ConfirmationModal';
import BackgroundCircles from '../../components/BackgroundCircles';
import SignInLanding from '../auth/SignInLanding';

export default function Account({ navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const user = useSelector(state => state?.user?.data);
    
    const userToken = useSelector(state => state?.auth?.token);
    const contacts = useSelector(state => state?.contacts?.data);
    const support = contacts?.find(item => item?.type == 'phone');
    
    const DATA = [
        {
            data: [
                { id: '0', title: t('My requests'), icon: 'diamond', screen: 'Subscription' },
                { id: '1', title: t('Change Password'), icon: 'lock-closed', screen: 'Change Password' },
                { id: '2', title: t('Wallet'), icon: 'card', screen: 'Wallet' },
                { id: '3', title: t('Invite Friends'), icon: 'share-social', action: () => handleShare() },
                { id: '4', title: t('Log Out'), icon: 'log-out', action: () => setLogoutModal(true) },
                { id: '5', title: t('Delete Account'), icon: 'remove-circle', action: () => setDeleteAccountModal(true) },
            ],
        },
        {
            data: [
                { id: '6', title: t('Help & Support'), icon: 'help-buoy', action: () => support?.link && Linking.openURL(support.link) },
                { id: '7', title: t('Terms & Conditions'), icon: 'shield-checkmark', screen: 'Terms & Conditions' },
                { id: '8', title: t('Privacy Policy'), icon: 'shield-half', screen: 'Privacy Policy' },
                { id: '9', title: t('About Us'), icon: 'information-circle', screen: 'About Us' },
                { id: '10', title: t('FAQ'), icon: 'help-circle', screen: 'FAQ' },
            ],
        },
    ];

    const [logoutModal, setLogoutModal] = useState(false);
    const logout = async () => {
        await AsyncStorage.multiRemove(['userId', 'userToken']);
        dispatch(emptyUser());
        dispatch(removeToken());
        navigation.reset({ index: 0, routes: [{ name: 'MainLayout' }] });
        const message = t('You have successfully logged out!');
        showToastOrAlert(message);
    };

    const [deleteAccountModal, setDeleteAccountModal] = useState(false);
    const deleteAccount = async () => {
        try {
            const response = await axios.get(`${uri}/deleteAccount`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            if (response.status === 200) {
                await AsyncStorage.multiRemove(['userId', 'userToken']);
                dispatch(emptyUser());
                dispatch(removeToken());
                navigation.reset({ index: 0, routes: [{ name: 'MainLayout' }] });
                const message = t('Your account has been deleted successfully!');
                showToastOrAlert(message);
            }
        } catch (error) {
            const message = error.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({ message: t('message') });
        } catch {
            const message = t('An unexpected error occurred!');
            showToastOrAlert(message);
        }
    };

    const headerHeight = useHeaderHeight();

    const HeaderSection = useMemo(() => (
        <View style={[styles.headerWrapper, NewStyles.row, { marginTop: headerHeight }]} >
            {user?.profile_photo_path ? (<Image style={[styles.profileImage, NewStyles.border100]} source={{ uri: `${imageUri}/${user?.profile_photo_path}` }} />) : (<View style={[styles.profileImage, NewStyles.border100, NewStyles.center]}><Text style={styles.profileImageThumbnail}>{user?.name ? user?.name[0] : 'ک'}</Text></View>)}
            <View>
                <Pressable style={[NewStyles.row, { gap: 5 }]} onPress={() => { navigation.navigate('Profile') }}>
                    {
                        (user?.name || user?.last_name) ?
                        <Text style={[NewStyles.text4, { textTransform: 'capitalize' }]}>{user?.name} {user?.last_name}</Text>
                        :
                        <Text style={[NewStyles.text4, { textTransform: 'capitalize' }]}>کاربر نل</Text>


                    }
                    <MaterialIcons name="edit" size={15} color={themeColor4.bgColor(1)} style={{ transform: [{ rotateY: '180deg' }] }} />
                </Pressable>
            </View>
        </View>
    ), [user]);

    if (!user) return <SignInLanding />;

    return (
        <View style={NewStyles.container}>
            <CustomStatusBar />
            {/* <Image source={require('../../assets/5297133.png')} style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0.2 }} /> */}
            <BackgroundCircles />
            <SectionList
                contentContainerStyle={styles.sectionListContainer}
                showsVerticalScrollIndicator={false}
                stickyHeaderHiddenOnScroll
                sections={DATA}
                keyExtractor={(item) => item?.id?.toString()}
                ListHeaderComponent={HeaderSection}
                renderItem={({ section, item, index }) => (
                    <Pressable style={[styles.itemWrapper, NewStyles.rowWrapper, NewStyles.shadow, index != section.data.length - 1 && styles.border, index === 0 && styles.borderTopRadius, index === section.data.length - 1 && styles.borderBottomRadius]} onPress={() => item.action ? item.action() : navigation.navigate(item.screen)}>
                        <View style={[NewStyles.row, { gap: 10 }]}>
                            <Ionicons name={item.icon} size={20} color={themeColor1.bgColor(1)} />
                            <Text style={NewStyles.text10}>{item?.title}</Text>
                        </View>
                        <Ionicons name='chevron-back' size={20} color={themeColor1.bgColor(1)} />
                    </Pressable>
                )}
                renderSectionFooter={() => <View style={styles.separator} />}
                ListFooterComponent={() => (
                    <View style={NewStyles.center}>
                        <Text style={NewStyles.text4}>{appVersion()} V</Text>
                    </View>
                )}
            />
            <ConfirmationModal confirmationModal={logoutModal} setConfirmationModal={setLogoutModal} title={`${t('Logout')}`} message={t('Are you sure you want to log out?')} action={logout} />
            <ConfirmationModal confirmationModal={deleteAccountModal} setConfirmationModal={setDeleteAccountModal} title={`${t('Delete Account')}`} message={t('Are you sure you want to delete your account?')} action={deleteAccount} />
        </View>
    )
}

const styles = StyleSheet.create({
    sectionListContainer: {
        paddingHorizontal: '5%'
    },
    headerWrapper: {
        paddingBottom: '5%',
        gap: 10
    },
    separator: {
        paddingVertical: 10,
    },
    itemWrapper: {
        backgroundColor: themeColor4.bgColor(1),
        padding: '4%',
    },
    border: {
        borderBottomColor: themeColor1.bgColor(1),
        borderBottomWidth: StyleSheet.hairlineWidth * 1.1,
    },
    borderTopRadius: {
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    borderBottomRadius: {
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    profileImage: {
        height: 70,
        width: 70,
        backgroundColor: themeColor4.bgColor(1),
    },
    profileImageThumbnail: {
        fontFamily: 'VazirBold',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center',
        textTransform: 'uppercase',
        color: themeColor1.bgColor(1),
    },
});
