import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import { useNewStyles, langIsRTL } from '../../styles/NewStyles';
import FilesProduct from '../../components/FilesProduct'
import { useTranslation } from 'react-i18next'

const HomeProductList = ({ title, data }) => {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const NewStyles = useNewStyles(lang);
  return (
    <View style={{}}>
      <Text style={[NewStyles.title10, { paddingHorizontal: 10 }]}>{title}</Text>
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        inverted={langIsRTL(lang)}
        data={data}
        contentContainerStyle={{ gap: 20, paddingHorizontal: 10 }}
        renderItem={({ item }) => {
          return (
            <FilesProduct item={item} type={'horizontal'} />
          )
        }}
      />
    </View>
  )
}

export default HomeProductList

const styles = StyleSheet.create({})