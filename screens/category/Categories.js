import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import NewStyles from '../../styles/NewStyles'
import CustomStatusBar from '../../components/CustomStatusBar'
import axios from 'axios'
import { uri } from '../../services/URL'
import Loader from '../../components/Loader'
import { useFocusEffect } from '@react-navigation/native'
import CategoriItem from './CategoriItem'
import { RefreshControl } from 'react-native'
import BlankScreen from '../../components/BlankScreen'

const Categories = ({ route }) => {
  const params = route?.params;
  const parentId = params?.parentId
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const fetchCategories = () => {
    axios.post(`${uri}/fetchCategories`, { parent_id: parentId })
      .then((res) => {
        setData(res?.data)
      })
      .catch((err) => {
        console.log(err, 'fetchCategories');
      })
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }
  useFocusEffect(useCallback(() => {
    fetchCategories()
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCategories() }} />}
        renderItem={({ item }) => {
          return (
            <CategoriItem item={item} />
          )
        }}
      />
    </SafeAreaView>
  )
}

export default Categories

const styles = StyleSheet.create({})