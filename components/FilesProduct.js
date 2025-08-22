import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import { ImageBackground } from 'expo-image';
import { dlUrl } from '../services/URL';
import NewStyles, { deviceWidth, deviceWidthScreen } from '../styles/NewStyles';
import { Dimensions } from 'react-native';
import { themeColor11, themeColor12, themeColor4 } from '../theme/Color';
import StarIcon from '../assets/svg/StarIcon';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../helpers/Common';
import { useNavigation } from '@react-navigation/native';

const FilesProduct = ({ item, type, explore }) => {
    const navigation = useNavigation()
    const { t } = useTranslation()
    const cardConfig = useMemo(() => {
        if (type == 'horizontal') {
            return {
                width: deviceWidth >= 768 ? 232.5 : 155,
                height: deviceWidth >= 768 ? 317.25 : 211.5,
            }
        } else {
            return {
                width: deviceWidth * 0.45,

                backgroundColor: themeColor4.bgColor(1)
            }
        }
        return null;
    }, [item]);
    if (type == 'horizontal') {

        return (
            <Pressable style={[cardConfig, NewStyles.border8, NewStyles.shadow, { marginVertical: 20 }]} onPress={() => { navigation.navigate('FileDetail', { id: item?.id }) }}>
                {type == 'horizontal' && <ImageBackground source={{ uri: `${dlUrl}/${item?.image_gallery?.image_path}` }} style={{ height: '100%', width: '100%' }} imageStyle={[NewStyles.border8]}>
                    {((item?.discounted_price && item?.discounted_price != null)) &&
                        <View style={{ alignSelf: 'flex-end', height: 35, width: 35, backgroundColor: 'red', borderTopRightRadius: 8, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center', paddingTop: 5 }}>
                            <Text style={{ color: '#fff', fontFamily: 'iransans', fontSize: 12 }}>{parseInt((1 - item?.discounted_price / item.price) * 100)}% </Text>
                        </View>
                    }
                </ImageBackground>}

            </Pressable>
        )
    } else if (item?.is_album == 0 || explore) {

        return (
            <Pressable style={[cardConfig, NewStyles.border8, NewStyles.shadow, { marginVertical: 20 }]} onPress={() => {
                if (item?.is_album == 1) {
                    navigation.navigate('AlbumDetail', { id: item?.id })
                } else {
                    navigation.navigate('FileDetail', { id: item?.id })
                }
            }}>
                {((item?.discounted_price && item?.discounted_price != null)) &&
                    <View style={{ position: 'absolute', zIndex: 1, alignSelf: 'flex-end', height: 35, width: 35, backgroundColor: 'red', borderTopRightRadius: 8, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center', paddingTop: 5 }}>
                        <Text style={{ color: '#fff', fontFamily: 'iransans', fontSize: 12 }}>{parseInt((1 - item?.discounted_price / item.price) * 100)}% </Text>
                    </View>
                }
                <Image source={{ uri: `${dlUrl}/${item?.image_gallery?.image_path}` }} style={[{ aspectRatio: 1, width: '100%' }, NewStyles.border8]} />
                <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', width: '100%', padding: 10, gap: 5, }}>
                    <Text style={[NewStyles.text10]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={[NewStyles.text1, { fontSize: 12 }]} numberOfLines={2}>
                        {item?.is_album == 1 ? item?.album_category?.title : item?.category?.title}
                    </Text>
                    <View style={[NewStyles.row, { gap: 5 }]}>
                        <Text style={NewStyles.text10}>{item.file_comment_avg_rate ? (parseFloat(item.file_comment_avg_rate).toFixed(1)) : 0}</Text>
                        <StarIcon color={themeColor12.bgColor(1)} />
                    </View>
                    <View style={[{ alignItems: 'flex-start', width: '100%' }, item?.discounted_price && NewStyles.rowWrapper]}>
                        {item?.discounted_price && <Text style={[NewStyles.discountText, NewStyles.text1, { fontSize: 11 }]}>{formatPrice(item?.price)} {t('currency')}</Text>}
                        <Text style={NewStyles.text10}>{item?.price == 0 ? t('Free') : formatPrice(item?.discounted_price ?? item?.price) + ' ' + t('currency')}</Text>
                    </View>
                </View>

            </Pressable>

        )
    } else if (item?.is_album == 1) {
        return (
            <Pressable style={[cardConfig, NewStyles.border8, item?.is_album == 0 && NewStyles.shadow, { marginVertical: 20 }]} onPress={() => {
                navigation.navigate('AlbumDetail', { id: item?.id })
            }}>
                {((item?.discounted_price && item?.discounted_price != null)) &&
                    <View style={{ position: 'absolute', zIndex: 1, alignSelf: 'flex-end', height: 35, width: 35, backgroundColor: 'red', borderTopRightRadius: 8, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center', paddingTop: 5 }}>
                        <Text style={{ color: '#fff', fontFamily: 'iransans', fontSize: 12 }}>{parseInt((1 - item?.discounted_price / item.price) * 100)}% </Text>
                    </View>
                }
                <Image source={{ uri: `${dlUrl}/${item?.image_gallery?.image_path}` }} style={[{ aspectRatio: 1, width: '100%' }, NewStyles.border8]} />
                <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', width: '100%', padding: 10, gap: 2, }}>
                    <Text style={[NewStyles.text10]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={[NewStyles.rowWrapper, { width: '100%' }]}>
                        <Text style={[NewStyles.text1, { fontSize: 12, flex: 1 }]} numberOfLines={2}>
                            {item?.album_category?.title}
                        </Text>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Text style={NewStyles.text10}>{item.file_comment_avg_rate ? (parseFloat(item.file_comment_avg_rate).toFixed(1)) : 0}</Text>
                            <StarIcon color={themeColor12.bgColor(1)} />
                        </View>
                    </View>
                    <View style={[{ alignItems: 'flex-start', width: '100%' }, item?.discounted_price && NewStyles.rowWrapper]}>
                        {item?.discounted_price && <Text style={[NewStyles.discountText, NewStyles.text1, { fontSize: 11 }]}>{formatPrice(item?.price)} {t('currency')}</Text>}
                        <Text style={NewStyles.text10}>{item?.price == 0 ? t('Free') : formatPrice(item?.discounted_price ?? item?.price) + ' ' + t('currency')}</Text>
                    </View>
                </View>

            </Pressable>
        )
    }
}

export default FilesProduct

const styles = StyleSheet.create({})