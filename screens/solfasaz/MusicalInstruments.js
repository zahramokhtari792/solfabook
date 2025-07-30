import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomStatusBar from '../../components/CustomStatusBar'
import NewStyles from '../../styles/NewStyles'

const MusicalInstruments = () => {
  return (
    <SafeAreaView style={NewStyles.container}>
      <CustomStatusBar />
      <Text>MusicalInstruments</Text>
    </SafeAreaView>
  )
}

export default MusicalInstruments

const styles = StyleSheet.create({})