import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import makeStyles, { deviceWidth } from '../../styles/NewStyles';
import { setLanguage } from '../../slices/languageSlice';
import Loader from '../../components/Loader';
import { themeColor0, themeColor5 } from '../../theme/Color';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchUser } from './../../slices/userSlice';
import BouncyCheckbox from '../../components/BouncyCheckbox';

const Language = () => {

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const lang = useSelector(state => state?.lang?.lang)
  const token = useSelector(state => state?.token?.token)
  const NewStyles = useMemo(() => makeStyles(lang), [lang]);
  const [loader, setLoader] = useState(false)
  const saveLanguage = async (lang) => {
    setLoader(true)
    try {
      await AsyncStorage.setItem('lang', lang);
      dispatch(setLanguage(lang));
    } catch (error) {
      console.error('Error saving language', error);
    } finally {
      setLoader(false)
    }
  };
  if (loader) {
    return (
      <Loader />
    )
  }
  return (
    <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={[NewStyles.container, { alignItems: 'center', paddingTop: 20 }]}>

      <View style={[styles.itemWrapper, NewStyles.rowWrapper]}>
        <BouncyCheckbox
          size={25}
          fillColor={themeColor0.bgColor(1)}
          unFillColor={themeColor5.bgColor(1)}
          iconStyle={{ borderColor: themeColor0.bgColor(1) }}
          text={'English'}
          innerIconStyle={{ borderWidth: 1 }}
          textStyle={[NewStyles.text, { textDecorationLine: 'none' }]}
          onPress={() => {
            i18n
              .changeLanguage('en')
              .then(() => {
                // RNRestart.restart();
                if(token){

                  dispatch(fetchUser({token, lang:'en'}))
                  
                }
              })
              .catch(err => {
                console.log('something went wrong while applying RTL', err);
              });
            saveLanguage('en');
          }}
          disableBuiltInState
          isChecked={lang == 'en' ? true : false}
        />
      </View>
      <View style={[styles.itemWrapper, NewStyles.rowWrapper]}>
        <BouncyCheckbox
          size={25}
          fillColor={themeColor0.bgColor(1)}
          unFillColor={themeColor5.bgColor(1)}
          iconStyle={{ borderColor: themeColor0.bgColor(1) }}
          text={'Persian'}
          innerIconStyle={{ borderWidth: 1 }}
          textStyle={[NewStyles.text, { textDecorationLine: 'none' }]}
          onPress={() => {
            i18n
              .changeLanguage('fa')
              .then(() => {
                if(token){

                  dispatch(fetchUser({token, lang:'fa'}))
                }
              })
              .catch(err => {
                console.log('something went wrong while applying RTL');
              });
            saveLanguage('fa');
          }}
          disableBuiltInState
          isChecked={lang == 'fa' ? true : false}

        />
      </View>
      <View style={[styles.itemWrapper, NewStyles.rowWrapper]}>
        <BouncyCheckbox
          size={25}
          fillColor={themeColor0.bgColor(1)}
          unFillColor={themeColor5.bgColor(1)}
          iconStyle={{ borderColor: themeColor0.bgColor(1) }}
          text={'Arabic'}
          innerIconStyle={{ borderWidth: 1 }}
          textStyle={[NewStyles.text, { textDecorationLine: 'none' }]}
          onPress={() => {
            i18n
              .changeLanguage('ar')
              .then(() => {
                if(token){

                  dispatch(fetchUser({token, lang:'ar'}))
                }
              })
              .catch(err => {
                console.log('something went wrong while applying RTL');
              });
            saveLanguage('ar');
          }}
          disableBuiltInState
          isChecked={lang == 'ar' ? true : false}

        />
      </View>
      <View style={[styles.itemWrapper, NewStyles.rowWrapper]}>
        <BouncyCheckbox
          size={25}
          fillColor={themeColor0.bgColor(1)}
          unFillColor={themeColor5.bgColor(1)}
          iconStyle={{ borderColor: themeColor0.bgColor(1) }}
          text={'Kurdish'}
          innerIconStyle={{ borderWidth: 1 }}
          textStyle={[NewStyles.text, { textDecorationLine: 'none' }]}
          onPress={() => {
            i18n
              .changeLanguage('ckb')
              .then(() => {
                if(token){

                  dispatch(fetchUser({token, lang:'ckb'}))
                }
              })
              .catch(err => {
                console.log('something went wrong while applying RTL');
              });
            saveLanguage('ckb');
          }}
          disableBuiltInState
          isChecked={lang == 'ckb' ? true : false}

        />
      </View>
      <View style={[styles.itemWrapper, NewStyles.rowWrapper]}>
        <BouncyCheckbox
          size={25}
          fillColor={themeColor0.bgColor(1)}
          unFillColor={themeColor5.bgColor(1)}
          iconStyle={{ borderColor: themeColor0.bgColor(1) }}
          text={'Turkish'}
          innerIconStyle={{ borderWidth: 1 }}
          textStyle={[NewStyles.text, { textDecorationLine: 'none' }]}
          onPress={() => {
            i18n
              .changeLanguage('tr')
              .then(() => {
                if(token){

                  dispatch(fetchUser({token, lang:'tr'}))
                }
              })
              .catch(err => {
                console.log('something went wrong while applying RTL');
              });
            saveLanguage('tr');
          }}
          disableBuiltInState
          isChecked={lang == 'tr' ? true : false}

        />
      </View>
    </SafeAreaView>
  )
}

export default Language

const styles = StyleSheet.create({
  itemWrapper: {
    width: deviceWidth * 0.95,
    // backgroundColor: themeColor5.bgColor(1),
    padding: 10,
  },

  contentContainerStyle: {
    flexGrow: 1,
    gap: 10,
    paddingTop: 20,
  },

  ListFooterComponentStyle: {
    flexGrow: 1,
    justifyContent: 'flex-end'
  },

  footerWrapper: {
    width: deviceWidth,
    backgroundColor: themeColor5.bgColor(1),
    paddingVertical: 20,
    paddingHorizontal: '5%'
  },
})