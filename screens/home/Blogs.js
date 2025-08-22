import { FlatList, Linking, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NewStyles, { deviceHeight, deviceWidth } from '../../styles/NewStyles'
import { TouchableOpacity } from 'react-native'
import { imageUri, mainUri } from '../../services/URL'
import { Image } from 'expo-image'
import { formatDate } from '../../helpers/Common'
import { themeColor3, themeColor4 } from '../../theme/Color'

const Blogs = ({ title, data }) => {
    return (
        <View>
            <Text style={[NewStyles.title10, { paddingHorizontal: 10, marginTop: 20, marginBottom: 30 }]}>{title}</Text>
            <FlatList
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                data={data}
                ItemSeparatorComponent={() => {
                    return (
                        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: themeColor3.bgColor(0.4), width: '100%', marginBottom: 2 }} />
                    )
                }}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity style={{ width: '95%', backgroundColor: themeColor4.bgColor(1), alignSelf: 'center', paddingVertical: 5, justifyContent: 'center', paddingTop: 20 }} onPress={() => {
                            Linking.openURL(`${mainUri}/blog/${item?.id}`)
                        }}>
                            <View style={[NewStyles.row, { width: '100%', aspectRatio:2.8 }]}>

                                <Image source={{ uri: `${imageUri}/${item.image_path}` }} style={{ width: '45%', height: '80%', borderRadius: 4 }} contentFit='cover' />

                                <Text style={[NewStyles.text10, { flex: 1, paddingHorizontal: 10 }]}>{item.title}</Text>
                            </View>
                            <Text style={[NewStyles.text10, { fontSize: 12, textAlign: 'left' }]}>{item?.created_at && formatDate(item?.created_at)}</Text>
                        </TouchableOpacity>
                    )
                }}
            />
        </View>
    )
}

export default Blogs

const styles = StyleSheet.create({})