import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NewStyles from '../../styles/NewStyles'
import FilesProduct from '../../components/FilesProduct'

const HomeProductList = ({title, data}) => {
  return (
    <View style={{}}>
      <Text style={[NewStyles.title10, {paddingHorizontal:10}]}>{title}</Text>
      <FlatList
      showsHorizontalScrollIndicator={false}
      horizontal
      inverted
      data={data}
      contentContainerStyle={{gap:20, paddingHorizontal:10}}
      renderItem={({item})=>{
        return(
            <FilesProduct item={item} type={'horizontal'} />
        )
      }}
      />
    </View>
  )
}

export default HomeProductList

const styles = StyleSheet.create({})