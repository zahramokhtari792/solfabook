import { FlatList, ImageBackground, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import NewStyles, { deviceWidth } from '../../styles/NewStyles'
import axios from 'axios'
import { imageUri, uri } from '../../services/URL'
import { handleError } from '../../helpers/Common'
import Loader from '../../components/Loader'
import { SafeAreaView } from 'react-native-safe-area-context'
import BlankScreen from '../../components/BlankScreen'
import { themeColor10, themeColor4 } from '../../theme/Color'
import { LinearGradient } from 'expo-linear-gradient'

const MusicalInstrument = ({navigation}) => {
    const [loader, setLoader] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [data, setData] = useState([])
    const allMusicalInstruments = () => {
        axios.get(`${uri}/allMusicalInstruments`)
            .then((res) => {
                setData(res?.data);

            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
                setLoader(false)
                setRefreshing(false)
            })
    }
    useEffect(() => {
        allMusicalInstruments()
    }, [])
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
                contentContainerStyle={[{ gap: 20, paddingVertical: 10, alignItems: 'center' }, data?.length == 0 && { flex: 1 }]}
                columnWrapperStyle={{ gap: 20 }}
                ListEmptyComponent={() => {
                    return (
                        <View style={[{ flex: 1 }, NewStyles.center]}>
                            <BlankScreen />
                        </View>
                    )
                }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); allMusicalInstruments() }} />}
                renderItem={({ item }) => {
                    return (
                        <Pressable style={[{width: deviceWidth * 0.42, aspectRatio: 1, backgroundColor: themeColor4.bgColor(1)}, NewStyles.border10]} onPress={()=>{
                            navigation.navigate('InstrumentDetail',{data:item})
                        }}>

                            <ImageBackground source={{ uri: `${imageUri}/${item?.image_path}` }} style={{ width: deviceWidth * 0.42, aspectRatio: 1, backgroundColor: themeColor4.bgColor(1) }} imageStyle={[NewStyles.border10]} resizeMode='contain'>
                                <LinearGradient colors={['transparent', themeColor10.bgColor(0.5)]} style={[{ height: '100%', width: '100%', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 10 }, NewStyles.border10]}>
                                    <Text style={NewStyles.title4}>{item?.title}</Text>
                                </LinearGradient>

                            </ImageBackground>
                        </Pressable>
                    )
                }}
            />
        </SafeAreaView>
    )
}

export default MusicalInstrument

const styles = StyleSheet.create({})