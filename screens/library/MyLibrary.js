import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NewStyles from '../../styles/NewStyles'
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
import { useSelector } from 'react-redux'
import SignInLanding from '../auth/SignInLanding'

const Tab = createMaterialTopTabNavigator();
const MyLibrary = () => {
  const { t } = useTranslation()
  const userToken = useSelector(state => state.auth?.token);
  const user = useSelector(state => state.user?.data);

  
  if (!userToken || !user) {
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
        <Tab.Screen name="Bookmarks" component={Bookmarks} options={{ title: t('Saved') }} />
        <Tab.Screen name="MyFavorite" component={MyFavorite} options={{ title: t('Favorite') }} />
      </Tab.Navigator>
    </SafeAreaView>
  )
}

export default MyLibrary

const styles = StyleSheet.create({})