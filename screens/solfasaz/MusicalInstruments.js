import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import CustomStatusBar from '../../components/CustomStatusBar'
import { useNewStyles } from '../../styles/NewStyles';
import { useTranslation } from 'react-i18next'

const MusicalInstruments = () => {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const NewStyles = useNewStyles(lang);
  return (
    <SafeAreaView style={NewStyles.container}>
      <CustomStatusBar />
      <Text>MusicalInstruments</Text>
    </SafeAreaView>
  )
}

export default MusicalInstruments

const styles = StyleSheet.create({})