import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import makeStyles from '../../styles/NewStyles'
import CustomStatusBar from '../../components/CustomStatusBar'
import Loader from '../../components/Loader'
import BlankScreen from '../../components/BlankScreen'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MyAlbum from './MyAlbum';
import MyFiles from './MyFiles';
import Bookmarks from './Bookmarks';
import MyFavorite from './MyFavorite';
import { useTranslation } from 'react-i18next'
import { themeColor0 } from '../../theme/Color'
import { useDispatch, useSelector } from 'react-redux'
import SignInLanding from '../auth/SignInLanding'
import { useInternetStatus } from '../../hooks/useInternetStatus'
import { fetchUser } from '../../slices/userSlice'

const Tab = createMaterialTopTabNavigator();
const MyLibrary = () => {
  const isOnline = useInternetStatus();

  const { t } = useTranslation()
  const userToken = useSelector(state => state.auth?.token);
  const user = useSelector(state => state.user?.data);
  const userLoading = useSelector(state => state.user?.loading);
  const { i18n } = useTranslation();
  const [loader, setLoader] = useState(false)
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const NewStyles = useMemo(() => makeStyles(lang), [lang]);
  const dispatch = useDispatch()
  useEffect(() => {
    if (userToken && isOnline && !user) {
      setLoader(true)
      dispatch(fetchUser(userToken))
      setLoader(false)
    }
  }, [isOnline, userToken])


  if(loader && userLoading){
    return(
      <Loader/>
    )
  }

  if (((!userToken || !user) && isOnline) || (!userToken && !isOnline)) {
    return (
      <SignInLanding />
    )
  }
  return (
    <SafeAreaView style={NewStyles.container} >
      <Tab.Navigator screenOptions={{
        tabBarLabelStyle: NewStyles.text10,
        tabBarIndicatorStyle: { backgroundColor: themeColor0.bgColor(1) }
      }}>
        <Tab.Screen name="MyFiles" component={MyFiles} options={{ title: t('File') }} />
        <Tab.Screen name="MyAlbum" component={MyAlbum} options={{ title: t('Album') }} />
        {isOnline && <Tab.Screen name="Bookmarks" component={Bookmarks} options={{ title: t('Saved') }} />}
        {isOnline && <Tab.Screen name="MyFavorite" component={MyFavorite} options={{ title: t('Favorite') }} />}
      </Tab.Navigator>
    </SafeAreaView>
  )
}

export default MyLibrary

const styles = StyleSheet.create({})