import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NewStyles from '../../styles/NewStyles'
import CustomStatusBar from '../../components/CustomStatusBar'

const Categories = () => {
  return (
    <SafeAreaView style={NewStyles.container}>
      <CustomStatusBar />
      <Text>Categories</Text>
    </SafeAreaView>
  )
}

export default Categories

const styles = StyleSheet.create({})