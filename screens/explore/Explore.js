import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import NewStyles from '../../styles/NewStyles';
import CustomStatusBar from '../../components/CustomStatusBar';
import axios from 'axios';
import { uri } from '../../services/URL';
import { handleError } from '../../helpers/Common';
import { useFocusEffect } from '@react-navigation/native';
import FilesProduct from '../../components/FilesProduct';
import BlankScreen from '../../components/BlankScreen';
import { ActivityIndicator } from 'react-native';
import { themeColor0 } from '../../theme/Color';

const Explore = () => {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // تابع fetchAllFiles را برای pagination بهینه کردیم
  const fetchAllFiles = async (reset = false) => {
    if (isLoading && !reset) return; // اگر در حال لود هستیم و reset نیست، از ادامه کار جلوگیری کن

    if (reset) {
      setPage(1);
      setHasMore(true);
      setData([]);
    }

    if (!hasMore && !reset) return;

    setIsLoading(true);
    setLoader(true); // این لودر برای اولین بارگذاری صفحه است

    try {
      const response = await axios.post(`${uri}/filesByCategories`, { page: reset ? 1 : page });
      const newFiles = response.data.data;

      setData(prevData => reset ? newFiles : [...prevData, ...newFiles]);
      setHasMore(newFiles.length > 0);
      if (newFiles.length > 0) {
        setPage(prevPage => prevPage + 1);
      }
    } catch (err) {
      console.log(err);
      handleError(err);
    } finally {
      setIsLoading(false);
      setLoader(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchAllFiles(true);
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllFiles(true); // هنگام refresh، داده‌ها را reset کن
  }, []);

  const renderFooter = () => {
    if (!isLoading) return null;
    return <ActivityIndicator style={{ margin: 10 }} color={themeColor0.bgColor(1)} size="small" />;
  };

  const renderEmptyComponent = () => {
    if (loader) return null; // اگر هنوز در حال بارگذاری اولیه هستیم، BlankScreen را نشان نده
    return <View style={{ flex: 1 }}><BlankScreen /></View>;
  };

  return (
    <SafeAreaView style={NewStyles.container}>
      <CustomStatusBar />
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        keyExtractor={(item) => item?.id?.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        columnWrapperStyle={{ justifyContent: 'center', gap: 10 }}
        contentContainerStyle={[{ paddingHorizontal: '5%' }, data?.length === 0 && { flex: 1 }]}
        renderItem={({ item }) => <FilesProduct item={item} type={"vertical"} explore={true} />}
        ListEmptyComponent={renderEmptyComponent}
        onEndReached={() => {
          if (!isLoading && hasMore) { // فقط در صورتی که لودینگ نیست و داده بیشتری هست، load کن
            fetchAllFiles();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
};

export default Explore;

const styles = StyleSheet.create({});