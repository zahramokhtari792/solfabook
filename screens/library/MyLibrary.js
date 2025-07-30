import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NewStyles from '../../styles/NewStyles'
import CustomStatusBar from '../../components/CustomStatusBar'
import Loader from '../../components/Loader'
import BlankScreen from '../../components/BlankScreen'

const MyLibrary = () => {
  return (
    <SafeAreaView style={NewStyles.container}>
      <CustomStatusBar/>
      <BlankScreen/>
    </SafeAreaView>
  )
}

export default MyLibrary

const styles = StyleSheet.create({})