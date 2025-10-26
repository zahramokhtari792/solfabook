import { FlatList, StyleSheet, Text, View, SafeAreaView, BackHandler, RefreshControl } from 'react-native'
import React, { useCallback, useState } from 'react'
import NewStyles from '../../styles/NewStyles'
import CustomStatusBar from '../../components/CustomStatusBar'
import axios from 'axios'
import { uri } from '../../services/URL'
import { useFocusEffect } from '@react-navigation/native'
import Loader from '../../components/Loader'
import CustomImageCarousal from './../../components/CustomImageCarousal';
import HomeProductList from './HomeProductList'
import ShowAlbumHome from './ShowAlbumHome'
import Blogs from './Blogs'
import DictionaryHome from './DictionaryHome'
import MusicalHomeSection from '../musicalinstrument/MusicalHomeSection'
import { useTranslation } from 'react-i18next'


const Home = () => {
  const { t } = useTranslation()
  const [data, setData] = useState([])
  const [loader, setLoader] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const homeData = () => {
    axios.get(`${uri}/homeData`)
      .then((res) => {
        setData(res?.data)
      })
      .catch((err) => {
        // Detailed logging to help diagnose network errors (message, code, config, request, response)
        try {
          console.log('AXIOS ERROR message:', err?.message);
          console.log('AXIOS ERROR code:', err?.code);
          console.log('AXIOS ERROR config:', err?.config);
          console.log('AXIOS ERROR request:', err?.request);
          console.log('AXIOS ERROR response:', err?.response);
        } catch (e) {
          console.log('Error logging axios error', e);
        }
      })
      .finally(() => {
        setRefreshing(false)
        setLoader(false)
      })
  }
  useFocusEffect(useCallback(() => {
    homeData()
  }, []))

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp(); // یا هر کاری که می‌خوای انجام بدی
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove(); // ✅ درست
    }, [])
  );

  if (loader) { return (<Loader />) }
  return (
    <SafeAreaView style={NewStyles.container}>
      <CustomStatusBar />
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item?.id?.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          homeData()
        }} />}
        renderItem={({ item }) => {


          return (
            <View>
              {item?.type == 'Banner' &&
                <View style={{ marginBottom: 20 }}>
                  <CustomImageCarousal data={item?.data} />
                </View>}
              {item?.type == 'File' && <HomeProductList data={item?.data} title={t(item?.title)} />}
              {item?.type == 'Album' && <ShowAlbumHome data={item?.data} title={t(item?.title)} />}
              {item?.type == 'Dictionary' && <DictionaryHome data={item?.data} title={t(item?.title)} />}
              {item?.type == 'Blog' && <Blogs data={item?.data} title={t(item?.title)} />}
              {item?.type == 'MusicalInstrument' && item?.data?.length > 0 && <MusicalHomeSection data={item} title={t(item?.title)} />}
            </View>
          )
        }}
      />
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({})