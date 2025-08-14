import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux';
import axios from 'axios';
import { uri } from '../../services/URL';
import { useFocusEffect } from '@react-navigation/native';
import NewStyles from '../../styles/NewStyles';
import MyFileComponent from './MyFileComponent';
import Loader from '../../components/Loader';
import FilesProduct from '../../components/FilesProduct';
import BlankScreen from '../../components/BlankScreen';

const Bookmarks = () => {
  const [data, setData] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loader, setLoader] = useState(true)
  const userToken = useSelector(state => state.auth?.token);
  const user = useSelector(state => state.user?.data);

  const fetchBookmark = () => {
    axios.get(`${uri}/fetchBookmark`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
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
    if (userToken) {
      fetchBookmark()
    }
  }, [userToken]))

  if (loader) {
    return (
      <Loader />
    )
  }
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          fetchBookmark()
        }} />}
        ListEmptyComponent={() => {
          return (
            <BlankScreen />
          )
        }}
        contentContainerStyle={[{ gap: 20, paddingTop: 10, alignSelf: 'center' }, data?.length == 0 && { flex: 1 }]}
        columnWrapperStyle={{ gap: 20, justifyContent: 'flex-end' }}
        renderItem={({ item }) => {
          return (
            <FilesProduct item={item?.file} type={'vertical'} />
          )
        }}
      />
    </SafeAreaView>
  )
}

export default Bookmarks

const styles = StyleSheet.create({})