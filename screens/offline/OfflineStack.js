import { StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import MyLibrary from '../library/MyLibrary'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useInternetStatus } from '../../hooks/useInternetStatus'

const OfflineStack = ({ navigation }) => {
  const isOnline = useInternetStatus();

  useEffect(() => {
    // فقط اگر وضعیت اینترنت "قطعاً" آنلاین شد (true)، ریست کن
    if (isOnline === true) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainLayout' }],
      });
    }
  }, [isOnline, navigation]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={{ top: 'additive', bottom: 'additive' }}>
      <MyLibrary />
    </SafeAreaView>
  )
}

export default OfflineStack

const styles = StyleSheet.create({})
