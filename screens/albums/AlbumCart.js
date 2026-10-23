import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { use, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useNewStyles } from '../../styles/NewStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { dlUrl, uri } from '../../services/URL';
import { formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';
import BlankScreen from '../../components/BlankScreen';
import { Ionicons } from '@expo/vector-icons';
import { themeColor1, themeColor4, themeColor6 } from '../../theme/Color';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchUser } from '../../slices/userSlice';
import * as Linking from "expo-linking";

const AlbumCart = () => {
    const navigation = useNavigation()
    const { i18n } = useTranslation();
    const { t } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useNewStyles(lang);
    const [data, setData] = useState([])
    const [loader, setLoader] = useState(true)
    const [paymentLoader, setPaymentLoader] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [removeLoader, setRemoveLoader] = useState(false)
    const userToken = useSelector(state => state.auth?.token)
    const user = useSelector(state => state.user?.data)
    const [fileGalleryId, setFileGalleryId] = useState()
    const handleRedirect = (event) => {
        const { queryParams } = Linking.parse(event?.url);
        console.log(queryParams);

        if (queryParams?.status == 'OK' && queryParams?.type == 'cart_pay') {
            fetchAlbumCarts()
            showToastOrAlert(t("Payment was successful."))
            navigation.navigate('MainLayout', { screen: 'MyLibrary', params: { screen: 'MyAlbum' } })
        } else if (queryParams?.status == 'NOK' && queryParams?.type == 'cart_pay') {
            showToastOrAlert(t('The payment encountered an error.'))
        }
    }


    const redirectUrl = Linking.createURL("/?");
    const gatewayAlbumCartPayment = async () => {
        try {
            let result = await Linking.openURL(`${uri}/gatewayAlbumCartPayment?linkingUri=${redirectUrl}&user_id=${user?.id}`);
            let redirectData;
            if (result.url) {
                redirectData = Linking.parse(result.url);
            }
        } catch (error) {
            setLoader(false);
        } finally {
            setLoader(false)
        }
    }
    useFocusEffect(
        React.useCallback(() => {
            const subscription = Linking.addEventListener('url', handleRedirect);

            return () => {
                subscription.remove();
            };
        }, [handleRedirect])
    );
    const dispatch = useDispatch()
    const fetchAlbumCarts = () => {
        axios.get(`${uri}/fetchAlbumCarts`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                setData(res?.data);
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
                setRefreshing(false)
                setRemoveLoader(false)
            })
    }

    const removeFromAlbumCart = (file_gallery_id) => {
        setFileGalleryId(file_gallery_id)
        setRemoveLoader(true)
        axios.post(`${uri}/removeFromAlbumCart`, { file_gallery_id: file_gallery_id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                fetchAlbumCarts()
            })
            .catch((err) => {
                console.log(err);
                setRemoveLoader(false)
                handleError(err)
            })
            .finally(() => {
                setFileGalleryId()
            })
    }

    const walletPayment = () => {
        setPaymentLoader(true)
        axios.post(`${uri}/walletAlbumCartPayment`, {}, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                console.log(res?.data);
                showToastOrAlert(t("Payment was successful."))
                navigation.navigate('MainLayout', { screen: 'MyLibrary', params: { screen: 'MyAlbum' } })
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setPaymentLoader(false)
                dispatch(fetchUser(userToken))
            })
    }
    useEffect(() => {
        fetchAlbumCarts()
    }, [])

    const totalPrice = () => {
        let total = 0;
        data?.forEach(item => {
            if (item?.file_gallery?.discounted_price) {
                total += Number(item?.file_gallery?.discounted_price)
            } else {
                total += Number(item?.file_gallery?.price)
            }
        })
        return (total)
    }

    if (loader) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            <FlatList
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
                    setRefreshing(true)
                    fetchAlbumCarts()
                }} />}
                data={data}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => {
                    return (
                        <BlankScreen />
                    )
                }}
                contentContainerStyle={[{ gap: 10, paddingHorizontal: '5%', paddingVertical: 15 }, data?.length == 0 && { flex: 1 }]}
                renderItem={({ item }) => {
                    return (
                        <View style={{ borderBottomColor: themeColor1.bgColor(0.7), borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 15 }}>
                            <View style={NewStyles.rowWrapper}>
                                <View style={[NewStyles.row, { gap: 10, flex: 1 }]}>
                                    <Image source={{ uri: `${dlUrl}/${item?.file_gallery?.file?.image_gallery?.image_path}` }} style={[{ width: 70, height: 70 }, NewStyles.border10]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[NewStyles.text10, { width: '90%', }]} >{item?.file_gallery?.title}</Text>
                                        <Text style={[NewStyles.text10, { width: '90%', }]}>{item?.publisher?.name}</Text>
                                        <View style={[NewStyles.row, { gap: 5 }]}>
                                            <Text style={[NewStyles.title10]}>{item?.file_gallery?.discounted_price ? formatPrice(item?.file_gallery?.discounted_price) : formatPrice(item?.file_gallery?.price)} {t("currency unit")}</Text>
                                            {
                                                item?.file_gallery?.discounted_price && <Text style={[NewStyles.text3, { textDecorationLine: 'line-through', textDecorationStyle: 'solid' }]}>{formatPrice(item?.file_gallery?.price)} {t("currency unit")}</Text>
                                            }
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity disabled={removeLoader} style={[{ padding: 10, backgroundColor: themeColor6.bgColor(0.1) }, NewStyles.border10]} onPress={() => {
                                    removeFromAlbumCart(item?.file_gallery_id)
                                }}>
                                    {removeLoader && fileGalleryId === item?.file_gallery_id ? <ActivityIndicator size="small" color={themeColor6.bgColor(1)} /> : <Ionicons name={'trash'} color={themeColor6.bgColor(1)} size={24} />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }}
            />
            {data?.length > 0 && <View style={{ width: '100%', backgroundColor: themeColor1.bgColor(0.1), paddingHorizontal: '5%', paddingTop: 20 }}>
                <Text style={NewStyles.title10}>{t("Total price")}: {formatPrice(totalPrice())} {t("currency unit")}</Text>
                <View style={[NewStyles.row, { gap: 10, }]}>
                    <View style={{ flex: 1 }}>
                        <Button
                            title={t('Wallet payment')}
                            onPress={() => {
                                walletPayment()
                            }}
                            loading={paymentLoader}
                        />
                    </View>
                    {totalPrice() > 0 && <View style={{ flex: 1 }}>
                        <Button
                            title={t('Gateway payment')}
                            onPress={() => {
                                gatewayAlbumCartPayment()
                            }}
                        />
                    </View>}
                </View>
            </View>}
        </SafeAreaView>
    )
}

export default AlbumCart

const styles = StyleSheet.create({})