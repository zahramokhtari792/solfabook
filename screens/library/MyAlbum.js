import { FlatList, RefreshControl } from 'react-native'
import React, { useMemo, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { uri } from '../../services/URL'
import { useNewStyles } from '../../styles/NewStyles';
import MyFileComponent from './MyFileComponent'
import Loader from '../../components/Loader'
import BlankScreen from '../../components/BlankScreen'
import { handleError, showToastOrAlert } from '../../helpers/Common'
import { useTranslation } from 'react-i18next'
import ConfirmationModal from '../../components/ConfirmationModal'
import { useInternetStatus } from '../../hooks/useInternetStatus'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const MyAlbum = () => {

  const isOnline = useInternetStatus()
  const queryClient = useQueryClient()

  const [refreshing, setRefreshing] = useState(false)
  const userToken = useSelector(state => state.auth?.token)

  const [modal, setModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState()

  const { t, i18n } = useTranslation()

  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en'
  const NewStyles = useNewStyles(lang);const fetchMyAlbums = useCallback(async () => {

    if (!userToken) return []

    const res = await axios.get(`${uri}/fetchMyAlbums`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    })

    return res?.data || []

  }, [userToken])


  const {
    data = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['my-albums', userToken],
    queryFn: fetchMyAlbums,
    enabled: !!userToken,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24 * 30,
    networkMode: 'offlineFirst',
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })


  const deleteFile = async () => {

    if (!isOnline) {
      showToastOrAlert(t('This action requires internet connection.'))
      return
    }

    try {

      setModal(false)

      const res = await axios.post(
        `${uri}/deleteMyFile`,
        { id: selectedFile },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        }
      )

      showToastOrAlert(
        t(res?.data?.message || 'Album deleted successfully.')
      )

      await queryClient.invalidateQueries({
        queryKey: ['my-albums', userToken],
      })

    } catch (err) {
      handleError(err, t)
    }
  }


  if (isLoading && !data?.length) {
    return <Loader />
  }


  return (
    <SafeAreaView
      edges={{ top: 'off', bottom: 'additive' }}
      style={NewStyles.container}
    >

      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        keyExtractor={(item, index) => String(item?.id ?? index)}

        refreshControl={
          <RefreshControl
            refreshing={refreshing || (isFetching && isOnline)}
            onRefresh={async () => {

              if (!isOnline) {
                showToastOrAlert(t('No internet connection'))
                return
              }

              setRefreshing(true)
              await refetch()
              setRefreshing(false)
            }}
          />
        }

        ListEmptyComponent={() => <BlankScreen />}

        contentContainerStyle={[
          { gap: 20, paddingTop: 10, alignSelf: 'center' },
          data?.length === 0 && { flex: 1 }
        ]}

        columnWrapperStyle={{
          gap: 20,
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}

        renderItem={({ item }) => (
          <MyFileComponent
            item={item}
            onLongPress={() => {
              setModal(true)
              setSelectedFile(item?.id)
            }}
          />
        )}
      />

      <ConfirmationModal
        confirmationModal={modal}
        setConfirmationModal={setModal}
        action={deleteFile}
        title={t('Delete')}
        message={t(
          'Are you sure you want to delete the album? By doing this, you will no longer have access to the purchased album.'
        )}
      />

    </SafeAreaView>
  )
}

export default MyAlbum
