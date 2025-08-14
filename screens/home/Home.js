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


const Home = () => {
  const [data, setData] = useState([])
  const [loader, setLoader] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const homeData = () => {
    axios.get(`${uri}/homeData`)
      .then((res) => {
        setData(res?.data)
      })
      .catch((err) => {
        console.log(err);
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
              {item?.type == 'File' && <HomeProductList data={item?.data} title={item?.title} />}
              {item?.type == 'Album' && <ShowAlbumHome data={item?.data} title={item?.title} />}
              {item?.type == 'Blog' && <Blogs data={item?.data} title={item?.title} />}
            </View>
          )
        }}
      />
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({})