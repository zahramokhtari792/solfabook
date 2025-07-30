import { FlatList,  StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import NewStyles from '../../styles/NewStyles'
import CustomStatusBar from '../../components/CustomStatusBar'
import axios from 'axios'
import { uri } from '../../services/URL'
import { useFocusEffect } from '@react-navigation/native'
import Loader from '../../components/Loader'
import CustomImageCarousal from './../../components/CustomImageCarousal';
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
  const [data, setData] = useState([])
  const [loader, setLoader] = useState(true)
  const homeData = () => {
    axios.get(`${uri}/homeData`)
      .then((res) => {
        setData(res?.data)
        console.log(res?.data);

      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoader(false)
      })
  }
  useFocusEffect(useCallback(() => {
    homeData()
  }, []))
  if (loader) { return (<Loader />) }
  return (
    <SafeAreaView style={NewStyles.container}>
      <CustomStatusBar />
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item?.id?.toString()}
        renderItem={({ item }) => {
          return (
            <View>
              {item?.type == 'Banner' && <CustomImageCarousal data={item?.data} />}
            </View>
          )
        }}
      />
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({})