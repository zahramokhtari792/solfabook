import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
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
  });

  if (!loaded && !error) {
    return null;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <NavigationContainer>
          <Provider store={store}>
            <Stack.Navigator>
              <Stack.Screen name='Landing' component={Landing} options={{ headerShown: false, gestureEnabled: false }} />
              <Stack.Screen name='MainLayout' component={MainLayout} options={{ headerShown: false, gestureEnabled: false }} />

            </Stack.Navigator>
          </Provider>
        </NavigationContainer>
      </I18nextProvider>
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
