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
import ConfirmationModal from '../../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { handleError, showToastOrAlert } from '../../helpers/Common';

const MyFiles = () => {
  const [data, setData] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loader, setLoader] = useState(true)
  const userToken = useSelector(state => state.auth?.token);
  const user = useSelector(state => state.user?.data);
  const [modal, setModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const { t } = useTranslation()
  const deleteFile = ()=>{
    setModal(false);
    setLoader(true)
    axios.post(`${uri}/deleteMyFile`, {id:selectedFile},  { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
    .then((res)=>{
      showToastOrAlert(res?.data?.message);
    })
    .catch((err)=>{
      handleError(err)
      console.log(err);
      
    })
    .finally(()=>{
      fetchMyFiles()
      setLoader(false)
    })
  }
  const fetchMyFiles = () => {
    axios.get(`${uri}/fetchMyFiles`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
      .then((res) => {
        setData(res?.data);
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
      fetchMyFiles()
    }
  }, [userToken]))

  if (loader) {
    return (
      <Loader />
    )
  }
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'off' }} style={NewStyles.container}>
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          fetchMyFiles()
        }} />}
        ListEmptyComponent={() => {
          return (
            <BlankScreen />
          )
        }}
        contentContainerStyle={[{ gap: 10, paddingVertical: 10, alignSelf: 'center' }, data?.length == 0 && { flex: 1 }]}
        columnWrapperStyle={{ gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}
        renderItem={({ item }) => {
          return (
            <MyFileComponent item={item} onLongPress={() => {
              setSelectedFile(item?.id)
              setModal(true);
            }} />
          )
        }}
      />
      <View>
        <ConfirmationModal confirmationModal={modal} setConfirmationModal={setModal} action={deleteFile} title={t('Delete')} message={t("Are you sure you want to delete the file? By doing this, you will no longer have access to the purchased file.")} />
      </View>
    </SafeAreaView>
  )
}

export default MyFiles

const styles = StyleSheet.create({})