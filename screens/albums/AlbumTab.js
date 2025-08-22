import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import NewStyles from '../../styles/NewStyles'
import CustomStatusBar from '../../components/CustomStatusBar'
import axios from 'axios'
import { uri } from '../../services/URL'
import Loader from '../../components/Loader'
import { useFocusEffect } from '@react-navigation/native'
import { RefreshControl } from 'react-native'
import BlankScreen from '../../components/BlankScreen'
import AlbumCategoryItem from './AlbumCategoryItem'

const AlbumTab = ({ route }) => {
  const params = route?.params;
  const parentId = params?.parentId
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const fetchAlbumCategories = () => {
    axios.post(`${uri}/fetchAlbumCategories`, { parent_id: parentId })
      .then((res) => {
        setData(res?.data)
      })
      .catch((err) => {
        console.log(err, 'fetchAlbumCategories');
      })
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }
  useFocusEffect(useCallback(() => {
    fetchAlbumCategories()
  }, [parentId]))
  if (loading) return (<Loader />)
  return (
    <SafeAreaView style={NewStyles.container}>
      <CustomStatusBar />
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        contentContainerStyle={[{ gap: 20, paddingVertical: 10, alignItems: 'center' }, data?.length==0 && {flex:1}]}
        columnWrapperStyle={{ gap: 20 }}
        ListEmptyComponent={()=>{
          return(
            <View style={[{flex:1}, NewStyles.center]}>
              <BlankScreen/>
            </View>
          )
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAlbumCategories() }} />}
        renderItem={({ item }) => {
          return (
            <AlbumCategoryItem item={item} />
          )
        }}
      />
    </SafeAreaView>
  )
}

export default AlbumTab

const styles = StyleSheet.create({})