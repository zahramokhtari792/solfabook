import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NewStyles from '../../styles/NewStyles'
import FileInfoItem from '../../components/FileInfoItem';

const MoreAboutFile2 = ({ route, navigation }) => {
  const params = route?.params;
  const data = params?.data;
  return (
    <View style={NewStyles.container}>
      <ScrollView>
        {
          data?.publisher &&
          <FileInfoItem title={'Publisher'} value={data?.publisher?.name} onPress={() => {
            navigation.navigate('PublisherProfile', { publisher: data?.publisher })
          }} />
        }
        {
          data?.writer &&
          <FileInfoItem title={'Writer'} value={data?.writer?.name} onPress={() => {
            navigation.navigate('ShowFileByWho', {
              role_id: data?.writer_id,
              role: 'writer',
              role_name: data?.writer?.name,
            })
          }} />
        }
        {
          data?.narrator &&
          <FileInfoItem title={'Narrator'} value={data?.narrator?.name} onPress={() => {
            navigation.navigate('ShowFileByWho', {
              role_id: data?.narrator_id,
              role: 'narrator',
              role_name: data?.narrator?.name,
            })
          }} />
        }
        {
          data?.translator &&
          <FileInfoItem title={'Translator'} value={data?.translator?.name} onPress={() => {
            navigation.navigate('ShowFileByWho', {
              role_id: data?.translator_id,
              role: 'translator',
              role_name: data?.translator?.name,
            })
          }} />
        }
        {
          data?.author &&
          <FileInfoItem title={'Author'} value={data?.author?.name} onPress={() => {
            navigation.navigate('ShowFileByWho', {
              role_id: data?.author_id,
              role: 'author',
              role_name: data?.author?.name,
            })
          }}  />
        }
      </ScrollView>
    </View>
  )
}

export default MoreAboutFile2

const styles = StyleSheet.create({})