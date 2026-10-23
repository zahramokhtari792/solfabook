import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { dlUrl, uri } from './../../services/URL';
import { useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import { useNewStyles } from '../../styles/NewStyles';
import PDFReaderWebView from './PDFReaderWebView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioPlayer from '../../components/AudioPlayer';
import * as ScreenOrientation from 'expo-screen-orientation';
import { CaptureProtection } from '../../helpers/CaptureProtection';
import AlbumIcon from '../../assets/svg/AlbumIcon';
import { themeColor0 } from '../../theme/Color';
import ModalPlayer from './ModalPlayer';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import { useQuery } from '@tanstack/react-query';

const PDFReader = ({ route }) => {

  if (Platform.OS === 'web') {
    const PDFReaderWeb = require('./PDFReaderWebView.web').default;
    return <PDFReaderWeb route={route} />;
  }

  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const NewStyles = useNewStyles(lang);

  const id = route?.params?.id;
  const userToken = useSelector(state => state.auth?.token);
  const user = useSelector(state => state.user?.data);

  const [lastPage, setLastPage] = useState(1);
  const [musicIndex, setMusicIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadedPdf, setDownloadedPdf] = useState(false);
  const [preferLocalPdf, setPreferLocalPdf] = useState(false);
  const [localPdfUri, setLocalPdfUri] = useState(null);

  /* ---------------- Capture Protection ---------------- */
  useEffect(() => {
    CaptureProtection.prevent();
    return () => CaptureProtection.allow();
  }, []);

  /* ---------------- Orientation ---------------- */
  useEffect(() => {
    ScreenOrientation.unlockAsync().catch(() => {});
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).catch(() => {});
    };
  }, []);

  /* ---------------- Fetch API ---------------- */

  const fetchFiles = async () => {
    const res = await axios.post(
      `${uri}/fetchFiles`,
      { id },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    return {
      file_pdf: res?.data?.file_pdf || [],
      file_audio: res?.data?.file_audio || [],
    };
  };

  const { data: fileData, isLoading } = useQuery({
    queryKey: ['pdf-reader-files', id, userToken],
    queryFn: fetchFiles,
    enabled: !!userToken && !!id,

    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24 * 30,

    networkMode: 'offlineFirst',

    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const data = useMemo(() => fileData?.file_pdf || [], [fileData]);
  const audio = useMemo(() => fileData?.file_audio || [], [fileData]);

  /* ---------------- Cookie ---------------- */

  const checkCookie = async () => {
    const storedPage = await AsyncStorage.getItem('lastPage');
    const file_id = await AsyncStorage.getItem('file_id');
    if (file_id == id && storedPage) {
      setLastPage(parseInt(storedPage));
    }
  };

  useEffect(() => {
    checkCookie();
  }, []);

  /* ---------------- Local PDF Check ---------------- */

  useEffect(() => {
    let active = true;

    if (!data?.[0]?.file_path) return;

    (async () => {
      try {
        const fileName = data[0].file_path.split('/').pop();
        const cacheDir = `${FileSystem.documentDirectory}pdf-cache/`;
        const localPath = `${cacheDir}${id}_${fileName}`;
        const donePath = `${localPath}.complete`;

        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });

        const info = await FileSystem.getInfoAsync(localPath);
        const done = await FileSystem.getInfoAsync(donePath);

        if (active && info.exists && done.exists) {
          setDownloadedPdf(true);
          setLocalPdfUri(info.uri);
        }
      } catch (e) {}
    })();

    return () => { active = false };
  }, [data]);

  /* ---------------- Download PDF ---------------- */

  const downloadPdf = async () => {
    if (downloadingPdf) return;
    if (!data?.[0]?.file_path) return;

    try {
      setDownloadingPdf(true);

      const fileName = data[0].file_path.split('/').pop();
      const cacheDir = `${FileSystem.documentDirectory}pdf-cache/`;
      const localPath = `${cacheDir}${id}_${fileName}`;
      const donePath = `${localPath}.complete`;

      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });

      const encoded = encodeURI(`${dlUrl}/${data[0].file_path}`);
      const result = await FileSystem.downloadAsync(encoded, localPath);

      if (result.status < 200 || result.status >= 300) {
        throw new Error('Download failed');
      }

      await FileSystem.writeAsStringAsync(donePath, 'ok');

      setDownloadedPdf(true);
      setLocalPdfUri(result.uri);

      Alert.alert(t('Download complete'), t('Use local PDF now?'), [
        { text: t('No'), style: 'cancel' },
        { text: t('Yes'), onPress: () => setPreferLocalPdf(true) },
      ]);

    } catch (e) {} 
    finally {
      setDownloadingPdf(false);
    }
  };

  /* ---------------- Loader ---------------- */

  if (isLoading && !fileData) {
    return <Loader />;
  }

  /* ---------------- Render ---------------- */

  return (
    <SafeAreaView style={NewStyles.container}>

      {audio?.length > 0 && (
        <View>
          <TouchableOpacity
            style={{ padding: 5, marginHorizontal: 15, marginTop: 5, alignSelf: 'flex-end' }}
            onPress={() => setVisible(true)}
          >
            <AlbumIcon color={themeColor0.bgColor(1)} />
          </TouchableOpacity>

          <Text
            style={[
              NewStyles.text10,
              { textAlign: 'center', marginVertical: 10, paddingHorizontal: '5%' }
            ]}
          >
            {audio?.[musicIndex]?.title}
          </Text>

          <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <PDFReaderWebView
          downloadedPdf={downloadedPdf}
          downloadPdf={downloadPdf}
          downloadingPdf={downloadingPdf}
          route={{
            params: {
              pdfUrl: `${dlUrl}/${data?.[0]?.file_path}`,
              id,
              localUri: localPdfUri,
              preferLocal: preferLocalPdf,
            },
          }}
        />
      </View>

      <ModalPlayer
        visible={visible}
        setVisible={setVisible}
        audio={audio}
        musicIndex={musicIndex}
        setMusicIndex={setMusicIndex}
        playing={playing}
        setPlaying={setPlaying}
      />

    </SafeAreaView>
  );
};

export default PDFReader;

const styles = StyleSheet.create({});
