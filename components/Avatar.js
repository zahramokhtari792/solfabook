import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { imageUri, mainUri } from '../services/URL'
import NewStyles from '../styles/NewStyles'

const Avatar = ({image}) => {
  return (
    <View>
      {image ? <Image source={{ uri: `${imageUri}/${image}` }} style={[{ height: 50, width: 50 }, NewStyles.border100]} /> : <Image source={{uri:`${mainUri}/images/user.png`}} style={[{ height: 50, width: 50 }, NewStyles.border100]}/>}
    </View>
  )
}

export default Avatar

const styles = StyleSheet.create({})