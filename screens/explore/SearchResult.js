import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../../styles/NewStyles';
import FilesProduct from '../../components/FilesProduct';
import CategoriItem from '../category/CategoriItem';
import AlbumCategoryItem from '../albums/AlbumCategoryItem';
import { useTranslation } from 'react-i18next';
import MyFileComponent from '../library/MyFileComponent';

const SearchResult = ({ route }) => {
    const params = route?.params;
    const { t } = useTranslation()
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <View style={{ paddingVertical: 15 }}>
                <Text style={[NewStyles.title10, { textAlign: 'center' }]}>{t("Search results in")} <Text style={NewStyles.title}>{params?.search}</Text></Text>
            </View>

            <FlatList
                showsVerticalScrollIndicator={false}
                data={params?.data?.filter(item => item?.data?.length > 0)}
                keyExtractor={item => item?.id}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => {
                    return (
                        <View>
                            <View style={{ paddingHorizontal: '5%' }}>
                                <Text style={NewStyles.text10}>{t(item?.title)}</Text>
                            </View>
                            {
                                item?.type == 'file' &&
                                <FlatList
                                    horizontal
                                    inverted
                                    maxToRenderPerBatch={3}
                                    windowSize={4}
                                    contentContainerStyle={{ gap: 10, paddingHorizontal: '5%', marginVertical: 5 }}
                                    showsHorizontalScrollIndicator={false}
                                    data={item?.data}
                                    renderItem={({ item: subItem }) => {
                                        return (
                                            <FilesProduct item={subItem} explore={true} />
                                        )
                                    }}
                                />
                            }
                            {
                                item?.type == 'category' &&
                                <FlatList
                                    horizontal
                                    inverted
                                    maxToRenderPerBatch={3}
                                    windowSize={4}
                                    contentContainerStyle={{ gap: 10, paddingHorizontal: '5%', marginVertical: 5 }}
                                    showsHorizontalScrollIndicator={false}
                                    data={item?.data}
                                    renderItem={({ item: subItem }) => {
                                        return (
                                            <CategoriItem item={subItem} />
                                        )
                                    }}
                                />
                            }
                            {
                                item?.type == 'album_category' &&
                                <FlatList
                                    horizontal
                                    inverted
                                    maxToRenderPerBatch={3}
                                    windowSize={4}
                                    contentContainerStyle={{ gap: 10, paddingHorizontal: '5%', marginVertical: 5 }}
                                    showsHorizontalScrollIndicator={false}
                                    data={item?.data}
                                    renderItem={({ item: subItem }) => {
                                        return (
                                            <AlbumCategoryItem item={subItem} />
                                        )
                                    }}
                                />
                            }
                            {
                                (item?.type == 'my_file' || item?.type=='my_album') &&
                                <FlatList
                                    horizontal
                                    inverted
                                    maxToRenderPerBatch={3}
                                    windowSize={4}
                                    contentContainerStyle={{ gap: 10, paddingHorizontal: '5%', marginVertical: 5 }}
                                    showsHorizontalScrollIndicator={false}
                                    data={item?.data}
                                    renderItem={({ item: subItem }) => {
                                        
                                        return (
                                            <MyFileComponent showTrash={false} item={subItem.file} />
                                        )
                                    }}
                                />
                            }
                            
                        </View>
                    )
                }}
            />

        </SafeAreaView>
    )
}

export default SearchResult

const styles = StyleSheet.create({})