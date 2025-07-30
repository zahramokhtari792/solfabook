import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NewStyles from '../../styles/NewStyles'
import CustomStatusBar from '../../components/CustomStatusBar'

const Explore = () => {
  return (
    <SafeAreaView style={NewStyles.container}>
      <CustomStatusBar/>
      <Text>Explore</Text>
    </SafeAreaView>
  )
}

export default Explore

const styles = StyleSheet.create({})