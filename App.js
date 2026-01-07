import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import en from './assets/locales/en.json';
import fa from './assets/locales/fa.json';
import { useFonts } from 'expo-font';
import { Provider } from 'react-redux';
import store from './store';
import Landing from './screens/Landing';
import MainLayout from './screens/MainLayout';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NewStyles from './styles/NewStyles';
import SubCategories from './screens/category/SubCategories';
import Categories from './screens/category/Categories';
import AllFiles from './screens/explore/AllFiles';
import Account from './screens/account/Account';
import BackHeader from './components/BackHeader';
import { LoginProvider } from './context/LoginProvider';
import LoginModal from './screens/auth/LoginModal';
import Profile from './screens/account/Profile';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Transactions from './screens/account/Transactions';
import Decrease from './screens/account/Decrease';
import Settings from './screens/account/Settings';
import ChangePassword from './screens/account/ChangePassword';
import ActiveDevice from './screens/account/ActiveDevice';
import { themeColor4 } from './theme/Color';
import FileDetail from './screens/explore/FileDetail';
import ShowFileByWho from './screens/explore/ShowFileByWho';
import PublisherProfile from './screens/explore/PublisherProfile';
import MoreAboutFile2 from './screens/explore/MoreAboutFile2';
import FullDescription from './screens/explore/FullDescription';
import MoreAboutFile from './screens/explore/MoreAboutFile';
import PDFReader from './screens/library/PDFReader';
import MusicPlayer from './screens/library/MusicPlayer';
import VideoPlayer from './screens/library/VideoPlayer';
import PictureAudio from './screens/library/PictureAudio';
import AlbumDetail from './screens/albums/AlbumDetail';
import SamplePDFReader from './screens/explore/SamplePDFReader';
import AlbumTab from './screens/albums/AlbumTab';
import AllAlbums from './screens/albums/AllAlbums';
import Dictionary from './screens/dictionary/Dictionary';
import WordDetail from './screens/dictionary/WordDetail';
import Subscription from './screens/dictionary/Subscription';
import BookmarkedWords from './screens/account/BookmarkedWords';
import { SearchProvider } from './context/SearchProvider';
import SearchModal from './screens/explore/SearchModal';
import SearchResult from './screens/explore/SearchResult';
import MusicalInstrumentIntro from './screens/musicalinstrument/MusicalInstrumentIntro';
import MusicalInstrument from './screens/musicalinstrument/MusicalInstrument';
import InstrumentDetail from './screens/musicalinstrument/InstrumentDetail';
import TermsAndConditions from './screens/resources/TermsAndConditions';
import PrivacyPolicy from './screens/resources/PrivacyPolicy';
import AboutUs from './screens/resources/AboutUs';
import Contact from './screens/resources/Contact';
import Blog from './screens/resources/Blog';
import PDFReaderWebView from './screens/library/PDFReaderWebView';


i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa },
    },
    lng: "fa",
    fallbackLng: "fa",
    interpolation: {
      escapeValue: false
    }
  });

const Stack = createNativeStackNavigator();
export default function App() {

  const [loaded, error] = useFonts({
    'DimaShekasteh': require('./assets/fonts/DimaShekasteh.ttf'),
    'iransans': require('./assets/fonts/iransans.ttf'),
    'VazirThin': require('./assets/fonts/VazirThin.ttf'),
  });

  if (!loaded && !error) {
    return null;
  }
  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView mode='padding' edges={{ top: 'maximum', bottom: 'off' }} style={NewStyles.container}>

          <I18nextProvider i18n={i18n}>
            <NavigationContainer>
              <KeyboardProvider>
                <Provider store={store}>
                  <LoginProvider>
                    <SearchProvider>
                      <Stack.Navigator>
                        <Stack.Screen name='Landing' component={Landing} options={{ headerShown: false, gestureEnabled: false }} />
                        <Stack.Screen name='MainLayout' component={MainLayout} options={{ headerShown: false, gestureEnabled: false, headerShadowVisible: false }} />
                        <Stack.Screen name='Categories' component={Categories} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='TermsAndConditions' component={TermsAndConditions} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='Blog' component={Blog} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='Contact' component={Contact} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicy} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='AboutUs' component={AboutUs} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='AlbumTab' component={AlbumTab} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='Account' component={Account} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='Profile' component={Profile} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='AllFiles' component={AllFiles} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='Transactions' component={Transactions} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='Decrease' component={Decrease} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='Settings' component={Settings} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='FileDetail' component={FileDetail} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='ChangePassword' component={ChangePassword} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='ShowFileByWho' component={ShowFileByWho} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='PublisherProfile' component={PublisherProfile} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='MoreAboutFile2' component={MoreAboutFile2} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='PDFReader' component={PDFReader} options={{ headerShown: false }} />
                        <Stack.Screen name='PDFReaderWebView' component={PDFReaderWebView} options={{ headerShown: false }} />
                        <Stack.Screen name='PictureAudio' component={PictureAudio} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='AlbumDetail' component={AlbumDetail} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='AllAlbums' component={AllAlbums} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='Dictionary' component={Dictionary} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='WordDetail' component={WordDetail} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='Subscription' component={Subscription} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='BookmarkedWords' component={BookmarkedWords} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='SearchResult' component={SearchResult} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='MusicalInstrumentIntro' component={MusicalInstrumentIntro} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='MusicalInstrument' component={MusicalInstrument} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='InstrumentDetail' component={InstrumentDetail} options={{ header: () => { return (<BackHeader />) } }} />
                        <Stack.Screen name='MusicPlayer' component={MusicPlayer} options={{ header: () => { return (<BackHeader transparent={true} />) } }} />
                        <Stack.Screen name='VideoPlayer' component={VideoPlayer} options={{ header: () => { return (<BackHeader transparent={true} />) } }} />
                        <Stack.Screen name='ActiveDevice' component={ActiveDevice} options={{
                          headerShown: false,
                          presentation: 'formSheet',
                          sheetGrabberVisible: true,
                          sheetCornerRadius: 25,
                          sheetAllowedDetents: [0.25, 0.5, 0.75],
                          contentStyle: {
                            backgroundColor: themeColor4.bgColor(1),
                          },
                        }} />
                        <Stack.Screen name='MoreAboutFile' component={MoreAboutFile} options={{
                          header: () => { return (<BackHeader />) }
                        }} />
                        <Stack.Screen name='FullDescription' component={FullDescription} options={{
                          header: () => { return (<BackHeader />) }
                        }} />
                        <Stack.Screen name='SamplePDFReader' component={SamplePDFReader} options={{
                          header: () => { return (<BackHeader />) }
                        }} />

                      </Stack.Navigator>
                      <LoginModal />
                      <SearchModal />
                    </SearchProvider>
                  </LoginProvider>
                </Provider>
              </KeyboardProvider>
            </NavigationContainer>
          </I18nextProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
