import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux';
import axios from 'axios';
import { uri } from '../../services/URL';
import { useFocusEffect } from '@react-navigation/native';
import FilesProduct from '../../components/FilesProduct';
import NewStyles from '../../styles/NewStyles';
import MyFileComponent from './MyFileComponent';
import Loader from '../../components/Loader';
import SignInLanding from '../auth/SignInLanding';
import BlankScreen from '../../components/BlankScreen';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '../../components/ConfirmationModal';

const MyAlbum = () => {
  const [data, setData] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loader, setLoader] = useState(true)
  const userToken = useSelector(state => state.auth?.token);
  const user = useSelector(state => state.user?.data);
  const [modal, setModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const { t } = useTranslation()
  const deleteFile = () => {
    setModal(false);
    setLoader(true)
    axios.post(`${uri}/deleteMyFile`, { id: selectedFile }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
      .then((res) => {
        showToastOrAlert(res?.data?.message);
      })
      .catch((err) => {
        handleError(err)
        console.log(err);

      })
      .finally(() => {
        fetchMyAlbums()
        setLoader(false)
      })
  }
  const fetchMyAlbums = () => {
    axios.get(`${uri}/fetchMyAlbums`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
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
      fetchMyAlbums()
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
          fetchMyAlbums()
        }} />}
        ListEmptyComponent={() => {
          return (
            <BlankScreen />
          )
        }}
        contentContainerStyle={[{ gap: 20, paddingTop: 10, alignSelf: 'center' }, data?.length == 0 && { flex: 1 }]}
        columnWrapperStyle={{ gap: 20, justifyContent: 'flex-end', alignItems: 'center' }}
        renderItem={({ item }) => {
          return (
            <MyFileComponent onLongPress={() => {
              setModal(true);
              setSelectedFile(item?.id)
            }} item={item} />
          )
        }}
      />
      <View>
        <ConfirmationModal confirmationModal={modal} setConfirmationModal={setModal} action={deleteFile} title={t('Delete')} message={t("Are you sure you want to delete the album? By doing this, you will no longer have access to the purchased album.")} />
      </View>
    </SafeAreaView>
  )
}

export default MyAlbum

const styles = StyleSheet.create({})