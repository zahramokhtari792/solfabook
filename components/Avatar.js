import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import { imageUri, mainUri } from '../services/URL'
import makeStyles from '../styles/NewStyles'
import { useTranslation } from 'react-i18next'

const Avatar = ({ image }) => {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';

  const NewStyles = useMemo(() => makeStyles(lang), [lang]);
  return (
    <View>
      {image ? <Image source={{ uri: `${imageUri}/${image}` }} style={[{ height: 50, width: 50 }, NewStyles.border100]} /> : <Image source={{ uri: `${mainUri}/images/user.png` }} style={[{ height: 50, width: 50 }, NewStyles.border100]} />}
    </View>
  )
}

export default Avatar

const styles = StyleSheet.create({})