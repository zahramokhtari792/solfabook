import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux';
import axios from 'axios';
import { uri } from '../../services/URL';
import { useFocusEffect } from '@react-navigation/native';
import makeStyles from '../../styles/NewStyles';
import MyFileComponent from './MyFileComponent';
import Loader from '../../components/Loader';
import BlankScreen from '../../components/BlankScreen';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useInternetStatus } from '../../hooks/useInternetStatus';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MyAlbum = () => {
  const isOnline = useInternetStatus();
  const queryClient = useQueryClient();

  const [refreshing, setRefreshing] = useState(false);
  const userToken = useSelector(state => state.auth?.token);
  const user = useSelector(state => state.user?.data);
  const [modal, setModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const { t, i18n } = useTranslation();

  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const NewStyles = useMemo(() => makeStyles(lang), [lang]);

  const fetchMyAlbums = async () => {
    const res = await axios.get(`${uri}/fetchMyAlbums`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    return res?.data || [];
  };
 
  const {
    data = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['my-albums', userToken],
    queryFn: fetchMyAlbums,
    enabled: !!userToken,
    staleTime: 0,   // 30 دقیقه
    gcTime: 1000 * 60 * 60 * 24 * Number(user?.remaining_days),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });


  const deleteFile = async () => {
    try {
      setModal(false);

      const res = await axios.post(
        `${uri}/deleteMyFile`,
        { id: selectedFile },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      showToastOrAlert(t(res?.data?.message || 'Album deleted successfully.'));

      await queryClient.invalidateQueries({ queryKey: ['my-albums', userToken] });
    } catch (err) {
      handleError(err, t);
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userToken && isOnline) {
        refetch();
      }
    }, [userToken, isOnline, refetch])
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={async () => {
              setRefreshing(true);
              await refetch();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={() => {
          return <BlankScreen />;
        }}
        contentContainerStyle={[
          { gap: 20, paddingTop: 10, alignSelf: 'center' },
          data?.length == 0 && { flex: 1 }
        ]}
        columnWrapperStyle={{ gap: 20, justifyContent: 'flex-end', alignItems: 'center' }}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        renderItem={({ item }) => {
          return (
            <MyFileComponent
              onLongPress={() => {
                setModal(true);
                setSelectedFile(item?.id);
              }}
              item={item}
            />
          );
        }}
      />

      <View>
        <ConfirmationModal
          confirmationModal={modal}
          setConfirmationModal={setModal}
          action={deleteFile}
          title={t('Delete')}
          message={t("Are you sure you want to delete the album? By doing this, you will no longer have access to the purchased album.")}
        />
      </View>
    </SafeAreaView>
  );
};

export default MyAlbum;

const styles = StyleSheet.create({});
