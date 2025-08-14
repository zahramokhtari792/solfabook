import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import NewStyles from '../../styles/NewStyles';
import axios from 'axios';
import { uri } from '../../services/URL';
import { handleError } from '../../helpers/Common';
import Loader from './../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import FilesProduct from '../../components/FilesProduct';
import BlankScreen from '../../components/BlankScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const ShowFileByWho = ({ route }) => {
    const params = route?.params;
    const [loader, setLoader] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [data, setData] = useState()
    const fetchFilesByWho = () => {
        axios.post(`${uri}/fetchFilesByWho`, { role_id: params?.role_id, role: params?.role })
            .then((res) => {
                setData(res?.data)
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
            })
    }
     const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFilesByWho(true); // هنگام refresh، داده‌ها را reset کن
      }, []);
    useFocusEffect(useCallback(() => {
        fetchFilesByWho()
    }, []))
    if (loader) {
        return (<Loader />)
    }
    return (
        <SafeAreaView style={NewStyles.container} edges={{top:'off', bottom:'additive'}}>
            <Text style={[NewStyles.text10, { marginVertical: 20, textAlign: 'center' }]}>بیشتر بخوانید از <Text style={[NewStyles.text, { fontSize: 16, textDecorationLine: 'underline' }]}>{params?.role_name}</Text></Text>

            <FlatList
                data={data}
                showsVerticalScrollIndicator={false}
                numColumns={2}
                keyExtractor={(item) => item?.id?.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                columnWrapperStyle={{ justifyContent: 'center', gap: 10 }}
                contentContainerStyle={[{ paddingHorizontal: '5%' }, data?.length === 0 && { flex: 1 }]}
                renderItem={({ item }) => <FilesProduct item={item} type={"vertical"} />}
                ListEmptyComponent={()=>{
                    return(
                        <BlankScreen/>
                    )
                }}
                
            />
        </SafeAreaView>
    )
}

export default ShowFileByWho

const styles = StyleSheet.create({})