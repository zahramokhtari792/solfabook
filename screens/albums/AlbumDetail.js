import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import NewStyles, { deviceWidthScreen } from '../../styles/NewStyles'
import axios from 'axios';
import { dlUrl, imageUri, uri } from '../../services/URL';
import { formatBytes, formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';
import Loader from '../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import { themeColor0, themeColor1, themeColor10, themeColor11, themeColor12, themeColor3, themeColor4, themeColor6, themeColor7 } from '../../theme/Color';
import ShareIcon from './../../assets/svg/ShareIcon';
import HeartIconFill from './../../assets/svg/HeartIconFill';
import HeartIcon from './../../assets/svg/HeartIcon';
import BookmarkFillIcon from './../../assets/svg/BookmarkFillIcon';
import BookmarkIcon from './../../assets/svg/BookmarkIcon';
import Share from 'react-native-share';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginModal } from '../../context/LoginProvider';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import StarIcon from '../../assets/svg/StarIcon';
import EmptyStarIcon from '../../assets/svg/EmptyStarIcon';
import * as Linking from "expo-linking";
import ConfirmationModal from './../../components/ConfirmationModal';
import Avatar from '../../components/Avatar';
import PaymentModal from '../../components/PaymentModal';
import AlertModal from '../../components/AlertModal';
import { LinearGradient } from 'expo-linear-gradient';
import AudioPlayer from '../../components/AudioPlayer';
import { fetchUser } from '../../slices/userSlice';

const AlbumDetail = ({ route, navigation }) => {
    const params = route?.params;
    const fileId = params?.id;
    const userToken = useSelector(state => state.auth?.token)
    const user = useSelector(state => state.user?.data)
    const [loader, setLoader] = useState(true)
    const [data, setData] = useState()
    const [musicIndex, setMusicIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [playNow, setPlayNow] = useState(false);
    const [score, setScore] = useState(0)
    const [message, setemessage] = useState('');
    const insets = useSafeAreaInsets();

    const { t } = useTranslation()
    const mood = [{ id: 1, name: t("Usefull") }, { id: 2, name: t("Fruitful") }, { id: 3, name: t("Fascinating") }, { id: 4, name: t('Informative') }]
    const [useful, setUseful] = useState(0);
    const [attractive, setAttractive] = useState(0);
    const [weighty, setWeighty] = useState(0);
    const [informative, setInformative] = useState(0);
    const [finalPrice, setFinalPrice] = useState();
    const [saved, setSaved] = useState(false);
    const [like, setLike] = useState(false);
    const [paymodal, setPayModal] = useState(false)
    const [visible, setVisible] = useState(false)
    const [visiblePlayer, setVisiblePlayer] = useState(false)
    const [text, setText] = useState();
    const [textBtn, setTextBtn] = useState();
    const [deleteModal, setDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showModal } = useLoginModal();
    const [comments, setComments] = useState([])
    const [myComment, setMyComments] = useState()
    const redirectUrl = Linking.createURL("/?");
    const dispatch = useDispatch()
    const addLinkingListenerWallet = (event) => {
        const { queryParams } = Linking.parse(event?.url);
        if (queryParams?.status == 'OK') {
            setText('خرید آلبوم با موفقیت انجام شد');
            setTextBtn('آلبوم های من')
            setVisible(true)
        } else if (queryParams?.status == 'NOK') {
            showToastOrAlert(t('The payment encountered an error.'))
        }
    }

    const gateWayPayment = async () => {
        setPayModal(false)
        try {
            let result = await Linking.openURL(`${uri}/gatewayPayment?linkingUri=${redirectUrl}&file_id=${fileId}&user_id=${user?.id}`);
            let redirectData;
            if (result.url) {
                redirectData = Linking.parse(result.url);
            }
        } catch (error) {
            setLoading(false);
        } finally {

        }
    }
    const walletPayment = () => {
        setPayModal(false)
        setLoader(true)
        axios.post(`${uri}/walletPayment`, { file_id: fileId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                console.log(res?.data);
                showToastOrAlert('خرید فایل با موفقیت انجام شد.')
                navigation.navigate('MainLayout', { screen: 'MyLibrary', params: { screen: 'MyAlbum' } })
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
                dispatch(fetchUser(userToken))
            })
    }

   
    const renderUserComments = useCallback(({ item }) => {
        return (
            <View style={[{ paddingBottom: 20, marginBottom: 20, backgroundColor: themeColor4.bgColor(1), marginVertical: 3, borderRadius: 10, padding: 10 }, NewStyles.shadow]}>

                <View style={[NewStyles.row, { marginTop: 10, alignItems: 'flex-start' }]}>
                    <Avatar image={item?.user?.profile_photo_path} />
                    <View style={{ marginLeft: 40, }}>
                        <View style={[NewStyles.rowWrapper, { marginHorizontal: 10, width: '90%' }]}>
                            <Text style={[NewStyles.text10]}>{item?.user?.fname} {item?.user?.lname}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <StarIcon color={themeColor12.bgColor(1)} width={11} height={11} />
                                <Text style={[NewStyles.text10, { marginHorizontal: 2 }]}>{item.rate} </Text>
                            </View>
                        </View>
                        <View style={[NewStyles.row, { flexWrap: 'wrap', marginTop: 10 }]}>
                            {item.useful == 1 &&
                                <View style={styles.moodContainer}>
                                    <Text style={styles.txtMood}>مفیدبود🙂</Text>
                                </View>
                            }

                            {item.weighty == 1 &&
                                <View style={styles.moodContainer}>
                                    <Text style={styles.txtMood}>پرباربود🤔</Text>
                                </View>
                            }
                            {item.attractive == 1 &&
                                <View style={styles.moodContainer}>
                                    <Text style={styles.txtMood}>جذاب بود🧐</Text>
                                </View>
                            }
                            {item.informative == 1 &&
                                <View style={styles.moodContainer}>
                                    <Text style={styles.txtMood}>آموزنده بود🤓</Text>
                                </View>
                            }
                        </View>
                    </View>
                </View>
                <View style={{ padding: 10, borderRadius: 8, marginTop: 10, marginHorizontal: 10 }}>
                    <Text style={NewStyles.text10}>{item.comment}</Text>
                </View>
            </View>
        )

    }, [comments]);


    const fetchFileComment = () => {
        axios.post(`${uri}/fetchFileComment`, { file_id: fileId })
            .then((res) => {
                setComments(res?.data);
            })
            .catch((err) => {
                handleError(err)
            })
    }

    const submitRate = () => {
        axios.post(`${uri}/submitRate`, { rate: score, comment: message, file_id: fileId, useful: useful, attractive: attractive, weighty: weighty, informative: informative }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {

                showToastOrAlert(res?.data?.message);
                checkLikedSaved();
                setScore(null)
                setemessage(null)
                setUseful(0);
                setAttractive(0);
                setWeighty(0);
                setInformative(0);
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }


    const checkLikedSaved = () => {
        axios.post(`${uri}/checkLikedSaved`, { id: fileId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                if (res?.data?.liked == 1) {
                    setLike(true)
                } else {
                    setLike(false)
                }
                if (res?.data?.saved == 1) {
                    setSaved(true)
                } else {
                    setSaved(false)
                }

                setMyComments(res?.data?.comment)
            })
            .catch((err) => {
                handleError(err)
            })
    }


    const likeFile = () => {
        axios.post(`${uri}/likeFile`, { id: fileId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                setLike(pre => !pre)
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {

            })
    }

    const handleLikeFile = useCallback(() => {
        if (user && userToken) likeFile();
        else showModal();
    }, [user, userToken]);
    const handleSaveFile = useCallback(() => {
        if (user && userToken) saveFile();
        else showModal();
    }, [user, userToken]);

    const saveFile = () => {
        axios.post(`${uri}/saveFile`, { id: fileId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                setSaved(pre => !pre)
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {

            })
    }

    const fetchFileDetail = () => {
        axios.post(`${uri}/fetchFileDetail`, { id: fileId })
            .then((res) => {
                setData(res?.data)

                if (res?.data?.discounted_price) {
                    setFinalPrice(res?.data?.discounted_price)
                } else {
                    setFinalPrice(res?.data?.price)
                }
            })
            .catch(err => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
            })
    }

    const deleteComment = () => {
        setLoader(true)
        axios.post(`${uri}/deleteFileComment`, { file_id: fileId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                showToastOrAlert(res?.data?.message)
            })
            .catch((err) => {
                handleError(err);
            })
            .finally(() => {
                checkLikedSaved()
                setLoader(false);

            })
    }

    useEffect(() => {
        if (userToken) {
            checkLikedSaved();
        }
    }, [userToken])
    useEffect(() => {
        const listener = Linking.addEventListener('url', addLinkingListenerWallet);

        return () => {
            listener.remove(); // موقع unmount شدن کامپوننت، لیسنر حذف میشه
        };
    }, []);
    useFocusEffect(useCallback(() => {
        fetchFileDetail()
        fetchFileComment()
    }, []))
    if (loader) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <KeyboardAvoidingView behavior={'padding'}
                keyboardVerticalOffset={Platform.OS === 'android' ? insets.bottom + 20 : insets.bottom + 60}
                style={{ flex: 1 }} >
                <ScrollView showsVerticalScrollIndicator={false} keyboardDismissMode='none' >


                    <View style={[{ width: '100%', backgroundColor: themeColor1.bgColor(0.2), paddingTop: 10, paddingBottom: 25 }, NewStyles.row]}>
                        <View style={{ flex: 1 }}></View>
                        <View style={[{ flex: 2 }, NewStyles.center]}>
                            <View style={[NewStyles.shadow, { backgroundColor: themeColor4.bgColor(1), elevation: 15, shadowColor: themeColor10.bgColor(1) }]}>
                                <Image
                                    source={{ uri: `${dlUrl}/${data?.image_gallery?.image_path}` }} style={[{ width: '100%', aspectRatio: 1, }]}
                                />
                            </View>
                        </View>
                        <View style={[{ flex: 1 }, NewStyles.center]}>
                            <View>
                                <TouchableOpacity style={{ padding: 8, }} onPress={handleSaveFile}>
                                    {saved ? <BookmarkFillIcon color={themeColor0.bgColor(1)} /> : <BookmarkIcon color={themeColor0.bgColor(1)} />}
                                </TouchableOpacity>
                                <TouchableOpacity style={{ padding: 8 }} onPress={handleLikeFile}>
                                    {like ? <HeartIconFill color={themeColor0.bgColor(1)} /> : <HeartIcon color={themeColor0.bgColor(1)} />}
                                </TouchableOpacity>
                                <TouchableOpacity style={{ padding: 8 }} onPress={() => {
                                    if (data?.base64) {
                                        Share.open({
                                            title: `اشتراک گذاری`,
                                            message: `${data?.title} را از سل‌فابوک دریافت کنید.\n سل‌فا‌بوک؛ کتابخانه موسیقی همیشه همراهت \nhttps://solfabook.com/file-detail/${fileId}`,
                                            url: data?.base64
                                        })
                                    }
                                }}>
                                    <ShareIcon color={themeColor0.bgColor(1)} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View>

                        <Text style={[NewStyles.title10, { textAlign: 'center', marginTop: 20, marginBottom: 10 }]}>{data?.title}</Text>
                        {(data?.publisher?.name) &&
                            <View style={[NewStyles.center, NewStyles.row, { marginBottom: 10 }]}>
                                <Text style={[NewStyles.text10]}>{t('Publisher')}: </Text>
                                <TouchableOpacity style={[NewStyles.row, NewStyles.center]} onPress={() => {

                                    navigation.navigate('PublisherProfile', { publisher: data?.publisher })

                                }}>
                                    <Text style={NewStyles.text10}>{data?.publisher?.name}</Text>
                                    <Image source={{ uri: `${imageUri}/${data?.publisher?.profile_photo_path}` }} style={{ height: 35, width: 35 }} />
                                </TouchableOpacity>
                            </View>
                        }
                        {
                            data?.publish_date &&
                            <Text style={[NewStyles.text10, { textAlign: 'center' }]}>{t('Publication date')}: {data?.publish_date.replaceAll('-', '/')}</Text>
                        }

                        <FlatList
                            numColumns={2}
                            scrollEnabled={false}
                            data={data?.sample_files}
                            contentContainerStyle={{ gap: 5, alignItems: 'flex-end', marginVertical: 10, }}
                            columnWrapperStyle={{ flexDirection: 'row-reverse' }}
                            renderItem={({ item, index }) => {
                                return (
                                    <View style={[NewStyles.row, { width: deviceWidthScreen * 0.5, paddingRight: 10, gap: 10 }]}>
                                        <ImageBackground style={[{ width: deviceWidthScreen * 0.2, aspectRatio: 1 }, NewStyles.center]} source={[{ uri: `${dlUrl}/${data?.image_gallery?.image_path}` }]} imageStyle={[NewStyles.border10, NewStyles.shadow]}>
                                            <LinearGradient colors={['transparent', themeColor10.bgColor(0.3), 'transparent']} style={[NewStyles.border10, { height: '100%', width: '100%' }, NewStyles.center]}>
                                                <TouchableOpacity onPress={() => {
                                                    setMusicIndex(index);
                                                    setVisiblePlayer(true)
                                                    if (index == musicIndex) { setPlayNow(!playing); } else { setPlayNow(true); }
                                                }}>
                                                    <Ionicons name={(playing && musicIndex === index) ? 'pause-circle' : 'play-circle'} color={themeColor4.bgColor(0.8)} size={40} />
                                                </TouchableOpacity>
                                            </LinearGradient>
                                        </ImageBackground>
                                        <View style={{ alignItems: 'flex-end', flex: 1 }}>
                                            <Text style={[NewStyles.text10, {}]}>{item?.title}</Text>
                                            <Text style={[NewStyles.text3, { fontSize: 12 }]}>{item?.duration}</Text>
                                        </View>
                                    </View>
                                )
                            }}
                        />
                        <View style={{ paddingHorizontal: '5%' }}>
                            <Pressable style={[styles.button, NewStyles.center, NewStyles.shadow, NewStyles.border8,]} onPress={() => {
                                if (finalPrice == 0) {
                                    walletPayment()
                                } else {
                                    setPayModal(true)
                                }
                            }}>
                                {finalPrice == 0 && <Text style={[NewStyles.title4]}>{t("Get free")}</Text>}
                                {finalPrice > 0 &&
                                    <View style={[NewStyles.row, { height: 45, gap: 5 }]}>
                                        <Text style={[NewStyles.title4]}>{t('Buy')}</Text>
                                        <View style={{ height: '50%', width: 2, backgroundColor: themeColor4.bgColor(1), marginHorizontal: 5 }} />
                                        <View style={[NewStyles.row, { gap: 5 }]}>
                                            <View>
                                                {data?.discounted_price && <Text style={[NewStyles.discountText, NewStyles.text4, { fontSize: 12 }]}>{formatPrice(data?.price)}</Text>}
                                                <Text style={NewStyles.text4}>{formatPrice(finalPrice)}</Text>
                                            </View>
                                            <Text style={NewStyles.text4}>{t('currency')}</Text>
                                        </View>
                                    </View>}
                            </Pressable>
                            {/* لینکش رو نذاشتم هنوز */}
                            {data?.is_shop == 1 && <Button title={t("Get a printed copy")} customStyle={{ backgroundColor: themeColor4.bgColor(1), borderWidth: 1, borderColor: themeColor0.bgColor(1), marginTop: 0 }} textStyle={{ color: themeColor0.bgColor(1) }} />}
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.sectiontitle, { marginVertical: 10 }]}>{t("About the album")}</Text>
                                <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: themeColor0.bgColor(1), width: '100%', padding: 10, borderRadius: 8 }}>
                                    <Text style={NewStyles.text10} numberOfLines={3}>{data?.des ? data?.des : data?.description}</Text>
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }} onPress={() => {
                                        navigation.navigate('FullDescription', { des: data?.des, description: data?.description, categoryName: data?.category?.title })
                                    }}>
                                        <Ionicons size={16} name='chevron-back' color={themeColor0.bgColor(1)} />
                                        <Text style={NewStyles.text}>{t("Full description")}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>

                        <View style={{ paddingHorizontal: '5%' }}>
                            <View style={NewStyles.rowWrapper}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.sectiontitle, { marginTop: 20, marginBottom: 10 }]}>{t("Album rating")}</Text>
                                </View>
                                <View style={[NewStyles.rowWrapper]}>
                                    <View style={[NewStyles.row]}>
                                        <Text style={{ fontFamily: 'iransans', marginHorizontal: 5, }}><Text style={{ fontSize: 11, color: themeColor1.bgColor(1) }}>{t("From {{num}} rates", { num: data?.file_comment_count })}</Text></Text>
                                        {data?.file_comment_avg_rate >= 1 ? <StarIcon color={themeColor12.bgColor(1)} height='15' width='15' /> : <EmptyStarIcon height='15' width='15' color={themeColor12.bgColor(1)} />}
                                        {data?.file_comment_avg_rate >= 2 ? <StarIcon color={themeColor12.bgColor(1)} height='15' width='15' /> : <EmptyStarIcon height='15' width='15' color={themeColor12.bgColor(1)} />}
                                        {data?.file_comment_avg_rate >= 3 ? <StarIcon color={themeColor12.bgColor(1)} height='15' width='15' /> : <EmptyStarIcon height='15' width='15' color={themeColor12.bgColor(1)} />}
                                        {data?.file_comment_avg_rate >= 4 ? <StarIcon color={themeColor12.bgColor(1)} height='15' width='15' /> : <EmptyStarIcon height='15' width='15' color={themeColor12.bgColor(1)} />}
                                        {data?.file_comment_avg_rate >= 5 ? <StarIcon color={themeColor12.bgColor(1)} height='15' width='15' /> : <EmptyStarIcon height='15' width='15' color={themeColor12.bgColor(1)} />}
                                    </View>
                                </View>
                            </View>

                        </View>

                        <View style={[{ paddingHorizontal: '5%', marginVertical: 10 }]}>
                            {!myComment && <>
                                <View style={[NewStyles.rowWrapper, { paddingVertical: 10, width: '45%', alignSelf: 'flex-end' }]}>
                                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => { setScore(1) }}>
                                        <EmptyStarIcon colorfill={score >= 1 ? themeColor0.bgColor(1) : themeColor4.bgColor(1)} color={themeColor0.bgColor(1)} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => { setScore(2) }}>
                                        <EmptyStarIcon colorfill={score >= 2 ? themeColor0.bgColor(1) : themeColor4.bgColor(1)} color={themeColor0.bgColor(1)} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => { setScore(3) }}>
                                        <EmptyStarIcon colorfill={score >= 3 ? themeColor0.bgColor(1) : themeColor4.bgColor(1)} color={themeColor0.bgColor(1)} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => { setScore(4) }}>
                                        <EmptyStarIcon colorfill={score >= 4 ? themeColor0.bgColor(1) : themeColor4.bgColor(1)} color={themeColor0.bgColor(1)} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => { setScore(5) }}>
                                        <EmptyStarIcon colorfill={score >= 5 ? themeColor0.bgColor(1) : themeColor4.bgColor(1)} color={themeColor0.bgColor(1)} />
                                    </TouchableOpacity>
                                </View>

                                <TextInput onChangeText={(text) => { setemessage(text) }} multiline cursorColor={themeColor0.bgColor(1)} style={{ borderColor: themeColor1.bgColor(1), borderRadius: 8, height: 150, width: '100%', borderWidth: StyleSheet.hairlineWidth, fontFamily: 'iransans', textAlignVertical: 'top', padding: 10, marginBottom: 10, textAlign: 'right' }} verticalAlign='top' placeholder={t('My opinion about this album...')} />
                                <Button title={t("Post a comment")} loading={loading} customStyle={{ marginTop: 0 }} onPress={() => {
                                    if (user && userToken) {
                                        if (score && message) {
                                            setLoading(true)
                                            submitRate()
                                        } else if (!score) {
                                            Alert.alert('🚫', t("To post a comment, you must give it a rating of 1 to 5 stars."), [{ text: t('Ok') }])
                                        } else {
                                            Alert.alert('🚫', t('To post a comment, you must write your comment!🙄'), [{ text: t('Ok') }])
                                        }
                                    } else {
                                        showModal()
                                    }
                                }} />
                            </>}

                            {myComment &&
                                <View style={[{ paddingBottom: 20, marginBottom: 20, backgroundColor: themeColor4.bgColor(1), marginVertical: 2, borderRadius: 10, padding: 10 }, NewStyles.shadow]}>
                                    <View style={[NewStyles.rowWrapper]}>
                                        <View style={[NewStyles.row, NewStyles.center]}>
                                            <Text style={[NewStyles.text10]}>{t("My opinion and rating")}</Text>
                                            <View style={[{ marginHorizontal: 5, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 100 }, myComment.is_show == 0 ? { backgroundColor: themeColor11.bgColor(0.2) } : { backgroundColor: themeColor7.bgColor(0.2) }]}>
                                                <Text style={[{ fontFamily: 'iransans', fontSize: 11 }, myComment.is_show == 0 ? { color: themeColor11.bgColor(1) } : { color: themeColor7.bgColor(1) }]}>{myComment.is_show == 0 ? t('Pending') : t('Published')}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => {
                                            setDeleteModal(true)
                                        }}>
                                            <Ionicons name='trash' color={themeColor6.bgColor(1)} size={20} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row-reverse', marginTop: 10, alignItems: 'flex-start' }}>
                                        <Avatar image={user?.profile_photo_path} />
                                        <View style={{ marginLeft: 40, }}>
                                            <View style={[NewStyles.row, { marginHorizontal: 10 }]}>
                                                <View style={{ marginHorizontal: 1 }}>
                                                    <StarIcon color={myComment.rate >= 1 ? themeColor0.bgColor(1) : themeColor1.bgColor(0.5)} />
                                                </View>
                                                <View style={{ marginHorizontal: 1 }}>
                                                    <StarIcon color={myComment.rate >= 2 ? themeColor0.bgColor(1) : themeColor1.bgColor(0.5)} />
                                                </View>
                                                <View style={{ marginHorizontal: 1 }}>
                                                    <StarIcon color={myComment.rate >= 3 ? themeColor0.bgColor(1) : themeColor1.bgColor(0.5)} />
                                                </View>
                                                <View style={{ marginHorizontal: 1 }}>
                                                    <StarIcon color={myComment.rate >= 4 ? themeColor0.bgColor(1) : themeColor1.bgColor(0.5)} />
                                                </View>
                                                <View style={{ marginHorizontal: 1 }}>
                                                    <StarIcon color={myComment.rate >= 5 ? themeColor0.bgColor(1) : themeColor1.bgColor(0.5)} />
                                                </View>
                                            </View>
                                            <View style={[NewStyles.row, { flexWrap: 'wrap', marginTop: 10 }]}>
                                                {myComment.useful == 1 &&
                                                    <View style={styles.moodContainer}>
                                                        <Text style={styles.txtMood}>{t('Usefull')}</Text>
                                                    </View>
                                                }

                                                {myComment.weighty == 1 &&
                                                    <View style={styles.moodContainer}>
                                                        <Text style={styles.txtMood}>{t('Fruitful')}</Text>
                                                    </View>
                                                }
                                                {myComment.attractive == 1 &&
                                                    <View style={styles.moodContainer}>
                                                        <Text style={styles.txtMood}>{t('Fascinating')}</Text>
                                                    </View>
                                                }
                                                {myComment.informative == 1 &&
                                                    <View style={styles.moodContainer}>
                                                        <Text style={styles.txtMood}>{t('Informative')}</Text>
                                                    </View>
                                                }
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ padding: 10, borderRadius: 8, marginTop: 10, marginHorizontal: 10 }}>
                                        <Text style={NewStyles.text10}>{myComment.comment}</Text>
                                    </View>
                                </View>
                            }
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.sectiontitle, { marginTop: 20, marginBottom: 10 }]}>{t("User comments")}</Text>
                            </View>

                        </View>
                        <FlatList
                            data={comments}
                            contentContainerStyle={{ paddingHorizontal: '5%' }}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderUserComments}
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
            <View>
                <ConfirmationModal confirmationModal={deleteModal} setConfirmationModal={setDeleteModal} title={t('Delete comment')} action={deleteComment} message={t('Are you sure you want to delete your comment?')} />
            </View>
            <View>
                <PaymentModal modal={paymodal} setModal={setPayModal} wallet={walletPayment} payment={gateWayPayment} />
            </View>
            <View>
                <AlertModal visible={visible}
                    text={text}
                    actionMoal={() => {
                        navigation.navigate('MainLayout', { screen: 'MyLibrary', params: { screen: 'MyAlbum' } })
                        setVisible(false)
                    }}
                    setVisible={setVisible}
                    textBtn={textBtn} />
            </View>
            {
                (data?.sample_files && visiblePlayer) && <View style={[{ backgroundColor: themeColor1.bgColor(0.2), paddingBottom: 10 }]}>
                    <TouchableOpacity style={{ padding: 10 }} onPress={() => {
                        setVisiblePlayer(false);
                        setPlayNow(false);
                        setPlaying(false)
                    }}>
                        <Ionicons name='close' color={themeColor6.bgColor(1)} size={20} />
                    </TouchableOpacity>
                    <AudioPlayer audio={data?.sample_files} setIndex={setMusicIndex} index={musicIndex} playing={playing} setPlaying={setPlaying} playNow={playNow} />
                </View>
            }
        </SafeAreaView>
    )
}

export default AlbumDetail

const styles = StyleSheet.create({
    button: {
        backgroundColor: themeColor0.bgColor(1),

        marginBottom: 10,
        height: 50
    },
    sectiontitle: {
        fontFamily: 'iransans',
        fontSize: 16,
        textAlign: 'right',
        marginBottom: 15,
        borderLeftColor: themeColor0.bgColor(1),
        borderLeftWidth: 2,
        borderRightColor: themeColor0.bgColor(1),
        borderRightWidth: 2,
        paddingHorizontal: 10,
        marginRight: 15
    },
    seprator: {
        flex: 1,
        borderLeftColor: themeColor0.bgColor(1),
        borderLeftWidth: StyleSheet.hairlineWidth,
        justifyContent: 'center',
        alignItems: 'center'
    },
    tinyText: {
        textAlign: 'center',
        fontFamily: 'iransans',
        fontSize: 10
    },
    txtMood: {
        fontFamily: 'iransans',
        fontSize: 11
    },
    moodContainer: {
        backgroundColor: themeColor1.bgColor(0.1),
        borderRadius: 50,
        padding: 5,
        marginHorizontal: 5,
        marginVertical: 2
    },
})