import { FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import NewStyles from '../../styles/NewStyles';
import CustomStatusBar from '../../components/CustomStatusBar';
import axios from 'axios';
import { dlUrl, uri } from '../../services/URL';
import { filterByFirstLetter, handleError, showToastOrAlert } from '../../helpers/Common';
import { useFocusEffect } from '@react-navigation/native';
import FilesProduct from '../../components/FilesProduct';
import BlankScreen from '../../components/BlankScreen';
import { ActivityIndicator } from 'react-native';
import { themeColor0, themeColor1, themeColor3, themeColor4 } from '../../theme/Color';
import WordItem from './WordItem';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from './../../components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchUser } from '../../slices/userSlice';
import { usePreventScreenCapture } from 'expo-screen-capture';

const Dictionary = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filteredWord, setFilteredWord] = useState()
  const [audioPath, setAudioPath] = useState()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const user = useSelector(state => state?.user?.data)
  const userToken = useSelector(state => state?.auth?.token)
  const player = useAudioPlayer(`${dlUrl}/${audioPath}`);
  const status = useAudioPlayerStatus(player);
  usePreventScreenCapture()
  useEffect(() => {
    if (!status) return;
    setPlaying(status.playing);
  }, [status]);
  const pauseSound = () => {
    if (player) {
      player.pause();
      setAudioPath()
    }
  };
  const playSound = () => {

    if (player) {
      player.play();
    }
  };
  // تابع fetchWords را برای pagination بهینه کردیم
  const fetchWords = async (reset = false) => {
    if (isLoading && !reset) return; // اگر در حال لود هستیم و reset نیست، از ادامه کار جلوگیری کن

    if (reset) {
      setPage(1);
      setHasMore(true);
      setData([]);
    }

    if (!hasMore && !reset) return;

    setIsLoading(true);
    setLoader(true); // این لودر برای اولین بارگذاری صفحه است


    try {
      const response = await axios.post(`${uri}/fetchWords`, { page: reset ? 1 : page, search: search, active_subscription: user ? user?.active_subscription : 0 });
      const newFiles = response.data.data;

      setData(prevData => reset ? newFiles : [...prevData, ...newFiles]);
      setHasMore(newFiles.length > 0);
      if (newFiles.length > 0) {
        setPage(prevPage => prevPage + 1);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
      setLoader(false);
      setRefreshing(false);
    }
  };
  useFocusEffect(useCallback(() => {
    if (userToken) {
      dispatch(fetchUser(userToken))
    }
  }, [userToken]))

  useEffect(() => {
    fetchWords(true);
  }, [])
  useEffect(() => {

    if (player && audioPath) {
      playSound()
    }
  }, [player])
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchUser(userToken))
    fetchWords(true); // هنگام refresh، داده‌ها را reset کن
  }, []);

  const renderFooter = () => {
    if (!isLoading) return null;
    return <ActivityIndicator style={{ margin: 10 }} color={themeColor0.bgColor(1)} size="small" />;
  };

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const renderEmptyComponent = () => {
    if (loader) return null; // اگر هنوز در حال بارگذاری اولیه هستیم، BlankScreen را نشان نده
    return <View style={{ flex: 1 }}><BlankScreen /></View>;
  };

  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <CustomStatusBar />
      <View style={[{ width: '90%', alignSelf: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: themeColor1.bgColor(1), marginVertical: 10, paddingHorizontal: 10 }, NewStyles.border100, NewStyles.row]}>
        <TextInput value={search} placeholderTextColor={themeColor1.bgColor(1)} onChangeText={(value) => { setSearch(value); }} placeholder={t('Search...')} style={[NewStyles.text10, { flex: 1, textAlign: 'auto', height: 50 }, NewStyles.border100]} onEndEditing={() => {
          if (user?.active_subscription == 1) {
            fetchWords(true);
          } else {
            showToastOrAlert(t('Subscribe to search for more words.'))
          }
        }} />
        <TouchableOpacity onPress={() => {
          if (user?.active_subscription == 1) {
            fetchWords(true);
          } else {
            showToastOrAlert(t('Subscribe to search for more words.'))
          }
        }}>
          <Ionicons name='search-outline' color={themeColor1.bgColor(1)} size={20} />
        </TouchableOpacity>
      </View>
      <View style={{ flexWrap: 'wrap', flexDirection: 'row', paddingHorizontal: '5%', alignContent: 'center', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        {letters.map((item, index) => {
          return (
            <TouchableOpacity key={index} onPress={() => {
              if (item == filteredWord) {
                setFilteredWord()

              } else {

                setFilteredWord(item)
              }
            }} style={[{ height: 30, width: 30, backgroundColor: themeColor1.bgColor(0.2) }, NewStyles.center, NewStyles.border5, filteredWord == item && { backgroundColor: themeColor0.bgColor(0.2) }]}><Text style={[NewStyles.text10, filteredWord == item && { color: themeColor0.bgColor(1) }]}>{item}</Text></TouchableOpacity>
          )
        })}
      </View>
      <FlatList
        data={filteredWord ? filterByFirstLetter(data, filteredWord) : data}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => {
          return (
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: themeColor3.bgColor(1), width: '100%' }} />
          )
        }}
        keyExtractor={(item) => item?.id?.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        scrollEnabled={(!user || user?.active_subscription == 0) ? false : true}
        contentContainerStyle={[{ paddingHorizontal: '5%' }, (data?.length === 0) && { flex: 1 }]}
        renderItem={({ item }) => {
          return (<WordItem onPress1={() => {
            if (player && audioPath) {
              pauseSound()
            }
            navigation.navigate('WordDetail', { word: item });
          }} onPress={() => {
            setAudioPath(item?.audio_path);
          }} playing={playing} item={item} audioPath={audioPath} />)
        }}
        ListEmptyComponent={renderEmptyComponent}
        onEndReached={() => {
          if (!isLoading && hasMore && user?.active_subscription == 1) { // فقط در صورتی که لودینگ نیست و داده بیشتری هست، load کن
            fetchWords();
            console.log('dd');

          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
      {(user?.active_subscription == 0 || !user) && (
        <View style={{ width: '100%', height: 190, position: 'absolute', bottom: 0 }}>
          <LinearGradient
            colors={[themeColor4.bgColor(0.1), themeColor0.bgColor(0.8)]}
            style={[{
              height: '100%',
              width: '100%',
              paddingBottom: 20,
            }, NewStyles.center]}
          >
            <View style={{ width: '90%' }}>
              <Button
                title={'برای مشاهده بیشتر، اشتراک تهیه کنید'}
                onPress={() => {
                  navigation.navigate('Subscription');
                }}
              />
            </View>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Dictionary;

const styles = StyleSheet.create({});