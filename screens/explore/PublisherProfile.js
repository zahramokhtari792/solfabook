import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios';
import { imageUri, uri } from '../../services/URL';
import { handleError } from '../../helpers/Common';
import Loader from '../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from '../../styles/NewStyles';
import StarIcon from '../../assets/svg/StarIcon';
import { themeColor0, themeColor11, themeColor12, themeColor4 } from '../../theme/Color';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FilesProduct from '../../components/FilesProduct';
import { useSelector } from 'react-redux';
import { useLoginModal } from '../../context/LoginProvider';
import RatingModal from '../../components/RatingModal';


const PublisherProfile = ({ route, navigation }) => {
  const params = route?.params;
  const publisher = params?.publisher;
  const [showFullText, setShowFullText] = useState(false);
  const [textShown, setTextShown] = useState(false);
  const [modal, setModal] = useState(false);
  const userToken = useSelector(state => state?.auth?.token);
  const { showModal } = useLoginModal();

  const handleTextLayout = (e) => {
    if (e.nativeEvent.lines.length > 2 && !textShown) {
      setTextShown(true);
    }
  };
  const { t } = useTranslation()
  const [data, setData] = useState([])
  const [loader, setLoader] = useState(true)
  const [rated, setRated] = useState(null)
  const [publisher_rate_avg_rate, setPublisher_rate_avg_rate] = useState(null)
  const [publisher_rate_count, setPublisher_rate_count] = useState(null)
  const checkRated = () => {
    axios.post(`${uri}/checkRated`, { id: publisher?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
      .then((res) => {
        setRated(res?.data?.rated)
       
      })
      .catch((err) => {
        console.log(err);
      })
  }


  const fetchPublisherFiles = () => {
    axios.post(`${uri}/fetchPublisherProfile`, { id: publisher?.id })
      .then((res) => {
        setData(res?.data?.data)
         setPublisher_rate_avg_rate(res?.data?.publisher_rate_avg_rate)
        setPublisher_rate_count(res?.data?.publisher_rate_count)
      })
      .catch((err) => {
        handleError(err)
      })
      .finally(() => {

        setLoader(false)
      })
  }
  useFocusEffect(useCallback(() => {
    fetchPublisherFiles()
  }, []))
  useEffect(() => {
    if (userToken) {
      checkRated()
    }
  }, [userToken])

  if (loader) {
    return (
      <Loader />
    )
  }
  return (
    <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
      <FlatList
        data={data}
        contentContainerStyle={{}}
        ListHeaderComponent={() => {
          return (
            <View style={[{ marginTop: 30, gap: 10, backgroundColor: themeColor4.bgColor(1), paddingHorizontal: '5%', paddingVertical: 10, marginHorizontal: '5%' }, NewStyles.shadow, NewStyles.border10]}>
              <Image source={{ uri: `${imageUri}/${publisher?.profile_photo_path}` }} style={{ width: 100, height: 100, resizeMode: 'cover', borderRadius: 20, alignSelf: 'center' }} />
              <View>
                <Text style={[NewStyles.title, { textAlign: 'center' }]}>{publisher?.name}</Text>
                <View style={[NewStyles.row, { gap: 5, alignSelf: 'center' }]}>
                  <StarIcon color={themeColor12.bgColor(1)} height='12' width='12' />
                  {!publisher_rate_avg_rate && <Text style={NewStyles.text10}>{(parseFloat(publisher?.publisher_rate_avg_rate)).toFixed(1) ?? '0'} <Text style={[NewStyles.text1, { fontSize: 11 }]}>({t("From {{num}} rates", { num: publisher?.publisher_rate_count })})</Text></Text>}
                  {publisher_rate_avg_rate && <Text style={NewStyles.text10}>{(parseFloat(publisher_rate_avg_rate)).toFixed(1) ?? '0'} <Text style={[NewStyles.text1, { fontSize: 11 }]}>({t("From {{num}} rates", { num: publisher_rate_count })})</Text></Text>}
                </View>

                {publisher.about && <Text style={[NewStyles.text10, { marginTop: 10, }]} numberOfLines={showFullText ? undefined : 2}
                  onTextLayout={handleTextLayout}>{publisher.about}</Text>} 
                {textShown && !showFullText && <TouchableOpacity style={[NewStyles.row, NewStyles.center]} onPress={() => {
                  setShowFullText(true)
                }}>
                  <Text style={[NewStyles.text, { marginHorizontal: 10 }]}>بیشتر</Text>
                  <Ionicons name='chevron-down' color={themeColor0.bgColor(1)} size={20} />
                </TouchableOpacity>}
                {(rated == 0 || !userToken) && <TouchableOpacity style={[NewStyles.row, { marginVertical: 5, marginHorizontal: 20 }, NewStyles.center]} onPress={() => {
                  if (userToken) {

                    setModal(true)
                  } else {
                    showModal()
                  }
                }}>
                  <StarIcon color={themeColor12.bgColor(1)} width={16} height={16} />
                  <Text style={[NewStyles.text, { textAlign: 'center', color: themeColor12.bgColor(1), marginHorizontal: 5 }]}>{t('Post a comment')}</Text>
                </TouchableOpacity>}
              </View>

            </View>
          )
        }}

        renderItem={({ item }) => {
          return (
            <View style={{ marginTop: 20 }}>
              <View style={[NewStyles.rowWrapper, { paddingHorizontal: '5%' }]}>
                <Text style={NewStyles.text}>{item?.title}</Text>
                <Pressable style={{ paddingHorizontal: 5 }} onPress={() => {
                  navigation.navigate('ShowFileByWho', { role_id: publisher?.id, role: 'publisher', role_name: publisher?.name })
                }}>
                  <Ionicons name='chevron-back' color={themeColor0.bgColor(1)} size={20} />
                </Pressable>
              </View>
              <FlatList
                horizontal
                contentContainerStyle={{ gap: 10, paddingHorizontal: '5%' }}
                showsHorizontalScrollIndicator={false}
                data={item?.data}
                inverted
                renderItem={({ item }) => {
                  return (
                    <FilesProduct item={item} />
                  )
                }}
              />
            </View>
          )
        }}
        showsVerticalScrollIndicator={false}
      />
      <View>
        <RatingModal modal={modal} setModal={setModal} publisher_id={publisher?.id} action={()=>{
          checkRated();
          fetchPublisherFiles()
        }} />
      </View>
    </SafeAreaView>
  )
}

export default PublisherProfile

const styles = StyleSheet.create({})