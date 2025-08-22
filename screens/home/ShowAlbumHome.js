import { FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { chunkArray, formatPrice } from '../../helpers/Common';
import { dlUrl } from './../../services/URL';
import NewStyles, { deviceWidthScreen } from '../../styles/NewStyles';
import { themeColor1, themeColor3 } from '../../theme/Color';
import { useNavigation } from '@react-navigation/native';


const ShowAlbumHome = ({ data, title, phone }) => {
    const chunkedData = chunkArray(data, 3);
    const navigation = useNavigation();

    const renderColumn = ({ item }) => {
        
        return ( 
            <View style={styles.column}>
                {item?.map((subItem, index) => {
                    return (
                        <Pressable key={index} style={[NewStyles.row, { maxWidth: 300 }]} onPress={() => {
                            navigation.navigate('AlbumDetail', { id: subItem?.id })
                        }}>
                            <ImageBackground source={{ uri: `${dlUrl}/${subItem?.image_gallery?.image_path}` }} imageStyle={[NewStyles.shadow, NewStyles.border8]} resizeMode='cover' style={[{ width: deviceWidthScreen * 0.235, maxWidth: 150, aspectRatio: 1, }, NewStyles.shadow, NewStyles.border8]} >
                                {((subItem?.discounted_price && subItem?.discounted_price != null)) &&
                                    <View style={{ alignSelf: 'flex-end', height: 35, width: 35, backgroundColor: 'red', borderTopRightRadius: 8, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center', paddingTop: 5 }}>
                                        <Text style={{ color: '#fff', fontFamily: 'iransans', fontSize: 12 }}>{parseInt((1 - subItem?.discounted_price / subItem?.price) * 100)}% </Text>
                                    </View>
                                }
                            </ImageBackground>

                            <View style={{ maxWidth: 150, marginRight: 5, }}>
                                <Text style={NewStyles.title10} numberOfLines={1}>{subItem?.title}</Text>
                                <Text style={NewStyles.text10} numberOfLines={1}>{subItem?.publisher?.name}</Text>
                                <View style={{}}>

                                    {subItem.price > 0 ? <Text style={{ textAlign: 'right', alignSelf: 'flex-end', fontFamily: 'iransans', marginTop: 5, fontSize: 13 }}>
                                        {subItem.discounted_price ? `${formatPrice(subItem.discounted_price)} تومان` : `${formatPrice(subItem.price)} تومان`}

                                    </Text>
                                        :
                                        <Text style={NewStyles.text10}>
                                            رایگان
                                        </Text>
                                    }
                                    {subItem.discounted_price && <Text style={[NewStyles.discountText, { color: themeColor3.bgColor(1), fontSize: 12 }]}>
                                        {subItem.price && formatPrice(subItem.price)} تومان
                                    </Text>
                                    }
                                </View>
                            </View>
                        </Pressable>
                    )
                })}
            </View>
        )
    };
    return (
        <View>
            <View style={[NewStyles.rowWrapper, { paddingRight: 10, marginBottom: 20, marginTop: 10 }]}>
                <Text style={[NewStyles.title10,]}>{title}</Text>
            </View>
            <FlatList
                style={{ marginLeft: 8 }}
                horizontal
                inverted
                data={chunkedData}
                renderItem={renderColumn}
                contentContainerStyle={{ gap: 15, paddingVertical: 5, alignItems: 'center' }}
                showsHorizontalScrollIndicator={false}
                ListFooterComponentStyle={{ backgroundColor: themeColor3.bgColor(0.25), alignSelf: 'stretch', justifyContent: 'center', borderTopLeftRadius: 5, borderBottomLeftRadius: 5, }}
                ListFooterComponent={() => {

                    return (
                        <Pressable onPress={() => {
                            navigation.navigate('AllAlbums')
                        }} style={{
                            marginVertical: 10, justifyContent: 'center', paddingHorizontal: 10, paddingVertical: '100%',
                        }}>
                            <View style={NewStyles.row}>
                                <Ionicons name="chevron-back-outline" size={20} color={themeColor1.bgColor(1)} />
                            </View>
                        </Pressable>
                    )
                }}
            />
        </View>
    )
}

export default ShowAlbumHome

const styles = StyleSheet.create({
    column: {
        flexDirection: 'column',
        marginRight: 10,
        gap: 10
    },
})