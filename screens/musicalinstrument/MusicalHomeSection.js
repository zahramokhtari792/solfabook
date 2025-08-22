import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NewStyles from '../../styles/NewStyles'
import { imageUri, mainUri } from '../../services/URL'
import { themeColor4 } from '../../theme/Color'
import { useNavigation } from '@react-navigation/native'

const MusicalHomeSection = ({ data, title }) => {
    const navigation = useNavigation()
    return (
        <View style={{ width: '100%' }}>
            <View style={[NewStyles.rowWrapper, { paddingRight: 10, marginBottom: 20, marginTop: 20 }]}>
                <Text style={[NewStyles.title10,]}>{title}</Text>
            </View>
            <Pressable style={[{ width: '100%', }, NewStyles.center, NewStyles.shadow]} onPress={() => {
                navigation.navigate('MusicalInstrumentIntro')
            }}>
                <Image source={{ uri: `${imageUri}/${data?.data?.[0]?.image_path}` }} style={[{ width: '95%', aspectRatio: 1.9, backgroundColor: themeColor4.bgColor(1) }, NewStyles.shadow, NewStyles.border10]} />
            </Pressable>
        </View>
    )
}

export default MusicalHomeSection

const styles = StyleSheet.create({})