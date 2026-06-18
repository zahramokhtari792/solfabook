import { FlatList, StyleSheet, Text, View, Dimensions } from 'react-native'
import React, { useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import makeStyles from '../../styles/NewStyles';
import FilesProduct from '../../components/FilesProduct';
import CategoriItem from '../category/CategoriItem';
import AlbumCategoryItem from '../albums/AlbumCategoryItem';
import { useTranslation } from 'react-i18next';
import MyFileComponent from '../library/MyFileComponent';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.42;

const SearchResult = ({ route }) => {

    const params = route?.params;
    const { t, i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);

    const sections = useMemo(() => {
        return params?.data?.filter(s => s?.data?.length > 0) ?? [];
    }, [params?.data]);

    const renderCard = (item, type) => {

        switch (type) {

            case 'file':
                return <FilesProduct type={"vertical"} item={item} explore />;

            case 'category':
                return <CategoriItem item={item} />;

            case 'album_category':
                return <AlbumCategoryItem item={item} />;

            case 'my_file':
            case 'my_album':
                return <MyFileComponent showTrash={false} item={item.file} />;

            default:
                return null;
        }
    };

    const renderSection = ({ item }) => {

        return (
            <View style={{ marginBottom: 20 }}>

                <View style={{ paddingHorizontal: '5%', marginBottom: 8 }}>
                    <Text style={NewStyles.text10}>
                        {t(item.title)}
                    </Text>
                </View>

                <FlatList
                    data={item.data}
                    numColumns={2}
                    keyExtractor={(i, idx) => `${item.type}-${idx}`}
                    scrollEnabled={false}
                    columnWrapperStyle={{
                        justifyContent: 'center',
                        gap: 14,
                    }}
                    renderItem={({ item: subItem }) => (
                        <View style={{ marginBottom: 10 }}>
                            {renderCard(subItem, item.type)}
                        </View>
                    )}
                />

            </View>
        )
    };

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>

            <View style={{ paddingVertical: 15 }}>
                <Text style={[NewStyles.title10, { textAlign: 'center' }]}>
                    {t("Search results in")} <Text style={NewStyles.title}>{params?.search}</Text>
                </Text>
            </View>

            <FlatList
                data={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderSection}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            />

        </SafeAreaView>
    )
}

export default SearchResult

const styles = StyleSheet.create({})
