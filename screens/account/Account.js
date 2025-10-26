import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import NewStyles from '../../styles/NewStyles'
import { themeColor0, themeColor1, themeColor4 } from '../../theme/Color'
import EditIcon from '../../assets/svg/EditIcon'
import { Image } from 'expo-image'
import { imageUri, mainUri } from '../../services/URL'
import { useDispatch, useSelector } from 'react-redux'
import { Ionicons } from '@expo/vector-icons';
import { formatPrice } from './../../helpers/Common';
import { useTranslation } from 'react-i18next'
import OptionsComponents from '../../components/OptionsComponents'
import { fetchUser } from './../../slices/userSlice';
import Wallet from '../../components/Wallet'

const Account = ({ navigation }) => {
  const user = useSelector(state => state.user?.data);
  const userLoading = useSelector(state => state.user?.loading);
  const userToken = useSelector(state => state.auth?.token);
  const { t } = useTranslation()
  const [modal, setModal] = useState(false)
  const dispatch = useDispatch()
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={[NewStyles.container, {}]}>
      <ScrollView contentContainerStyle={{ padding: '5%' }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={userLoading} onRefresh={() => {
        dispatch(fetchUser(userToken))
      }} />}>
        <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '100%', padding: 15 }, NewStyles.rowWrapper, NewStyles.shadow, NewStyles.border10]}>
          <Pressable style={[styles.box, NewStyles.border10, { alignSelf: 'flex-start' }]} onPress={() => {
            navigation.navigate('Profile')
          }}>
            <EditIcon color={themeColor0.bgColor(1)} />
          </Pressable>
          <View style={NewStyles.row}>
            <View style={{ padding: 10, gap: 5, alignItems: 'flex-start' }}>
              <Text style={NewStyles.text10}>{user?.fname} {user?.lname}</Text>
              {/* <View style={[NewStyles.row, { gap: 5 }]}>
                <Text style={NewStyles.text10}>{user?.phone}</Text>
                <View style={[styles.box, NewStyles.border5]}>
                  <Ionicons name='call' color={themeColor0.bgColor(1)} size={16} />
                </View>
              </View> */}
              {user?.apple_check != 1 && <View style={[NewStyles.row, { gap: 5 }]}>
                <Text style={NewStyles.text10}>{formatPrice(user?.wallet)} {t('currency')}</Text>
                <View style={[styles.box, NewStyles.border5]}>
                  <Ionicons name='wallet' color={themeColor0.bgColor(1)} size={16} />
                </View>
              </View>}
              {user?.apple_check != 1 && user?.remaining_days > 0 && <View style={[NewStyles.row, { gap: 5 }]}>
                <Text style={NewStyles.text10}>{t("{{num}} days left", { num: parseInt(user?.remaining_days) })}</Text>
                <View style={[styles.box, NewStyles.border5]}>
                  <Ionicons name='diamond' color={themeColor0.bgColor(1)} size={16} />
                </View>
              </View>}
            </View>
            <Image source={{ uri: user?.profile_photo_path ? `${imageUri}/${user?.profile_photo_path}` : `${mainUri}/images/user.png` }} style={[{ height: 85, width: 85 }, NewStyles.border100]} />
          </View>

        </View>
        {user?.apple_check != 1 && <View style={[NewStyles.row, { gap: 10 }]}>
          <View style={{ flex: 1 }}>
            <OptionsComponents txt={t('Wallet')} icon={'wallet'} onPress={() => {
              setModal(true)
            }} />
          </View>
          <View style={{ flex: 1 }}>
            <OptionsComponents txt={t('Transactions')} icon={'reorder-four'} onPress={() => { navigation.navigate('Transactions') }} />
          </View>
        </View>}
        {user?.apple_check != 1 && <OptionsComponents txt={t('Bookmarked words')} icon={'bookmarks'} onPress={() => { navigation.navigate('BookmarkedWords') }} />}
        {user?.apple_check != 1 && <OptionsComponents txt={t('Withdraw Requests')} icon={'arrow-up-circle'} onPress={() => { navigation.navigate('Decrease') }} />}
        <OptionsComponents txt={t('Settings')} icon={'settings'} onPress={() => { navigation.navigate('Settings') }} />
        <OptionsComponents txt={t('About Us')} icon={'information-circle'} onPress={() => { navigation.navigate('AboutUs') }} />
        <OptionsComponents txt={t('Contact Us')} icon={'help-circle'} onPress={() => {
          navigation.navigate('Contact')
        }} />
        <OptionsComponents txt={t('Terms & Conditions')} icon={'shield-checkmark'} onPress={() => {
          navigation.navigate('TermsAndConditions')
        }} />
        <OptionsComponents txt={t('Privacy Policy')} icon={'shield-half'} onPress={() => {
          navigation.navigate('PrivacyPolicy')
        }} />
      </ScrollView>
      <View>
        <Wallet modal={modal} setModal={setModal} />
      </View>
    </SafeAreaView>
  )
}

export default Account

const styles = StyleSheet.create({
  box: {
    padding: 5,
    backgroundColor: themeColor1.bgColor(0.2)
  }
})