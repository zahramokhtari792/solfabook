import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { chunkArray, formatPrice } from '../../helpers/Common'; 
import { dlUrl } from './../../services/URL';
import NewStyles from '../../styles/NewStyles';
import { themeColor1, themeColor3 } from '../../theme/Color';
import { useNavigation } from '@react-navigation/native';


const ShowAlbumHome = ({ data, title,  phone }) => {
    const chunkedData = chunkArray(data, 3);
    const navigation = useNavigation()
    const renderColumn = ({ item }) => {
        return (
            <View style={styles.column}>
                {item?.map((subItem, index) => {
                    return (
                        <Pressable key={index} style={NewStyles.row} onPress={() => { 
                        ;navigation.navigate('AlbumDetail',{id:subItem?.id})}}>
                            <Image source={{ uri: `${dlUrl}/${subItem?.image_gallery?.image_path}` }} resizeMode='cover' style={[{height:90,width:90}, NewStyles.shadow, NewStyles.border8]} />
                            <View style={{ maxWidth: 150, marginRight: 5 }}>
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
                                    {subItem.discounted_price && <Text style={[NewStyles.discountText,{color:themeColor3.bgColor(1), fontSize:12}]}>
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
            <View style={[NewStyles.rowWrapper,  {paddingRight:10, marginBottom:20, marginTop:10}]}>
                <Text style={[NewStyles.title10,]}>{title}</Text>
            </View>
            <FlatList
                style={{ marginLeft: 8 }}
                horizontal
                inverted
                data={chunkedData}
                renderItem={renderColumn}
                contentContainerStyle={{ gap: 15, paddingVertical:5 }}
                showsHorizontalScrollIndicator={false}

                ListFooterComponent={() => {
                    return (
                        <Pressable onPress={() => {
                           
                        }} style={{
                            height: 270, marginVertical: 10, justifyContent: 'center', borderTopLeftRadius: 5, borderBottomLeftRadius: 5, paddingHorizontal: 10,
                            backgroundColor: themeColor3.bgColor(0.25)
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