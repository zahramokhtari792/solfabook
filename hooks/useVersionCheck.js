import { useState, useEffect } from 'react';
import { Platform, ToastAndroid, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { uri } from '../services/URL';

const showToast = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert('اطلاعیه', message);
  }
};

const LAST_CHECK_KEY = '@last_version_check';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

const normalizeVersion = (version) => {
  // "1.02" → "1.0.2" یا "1.2" → "1.2.0"
  const parts = version.split('.');
  while (parts.length < 3) parts.push('0');
  return parts.join('.');
};

const compareVersions = (current, latest) => {
  // نرمال‌سازی ورژن‌ها
  const normalizedCurrent = normalizeVersion(current);
  const normalizedLatest = normalizeVersion(latest);
  
  const currentParts = normalizedCurrent.split('.').map(Number);
  const latestParts = normalizedLatest.split('.').map(Number);

  console.log('🔢 Normalized versions - Current:', normalizedCurrent, 'Latest:', normalizedLatest);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;

    if (latestPart > currentPart) return true; // نیاز به آپدیت
    if (latestPart < currentPart) return false; // ورژن فعلی جدیدتره
  }

  return false; // ورژن‌ها برابرند
};

export const useVersionCheck = () => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkVersion = async (forceCheck = false) => {
    try {
      // در وب نیازی به چک نیست
      if (Platform.OS === 'web') {
        setLoading(false);
        return;
      }

      // چک کردن آخرین زمان بررسی
      if (!forceCheck) {
        const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
        
        if (lastCheck) {
            const timeSinceLastCheck = Date.now() - parseInt(lastCheck);
            if (timeSinceLastCheck < CHECK_INTERVAL) {
                setLoading(false);
                return; // هنوز وقت چک نشده
            }
        }
      }

      // گرفتن ورژن فعلی
      const currentVersion = Constants.expoConfig?.version || '1.0.0';
      console.log('🔍 Checking version - Current:', currentVersion, 'API URL:', `${uri}/checkAppVersion`);

      // فراخوانی API
      const response = await axios.get(`${uri}/checkAppVersion`, {
        params: {
          platform: Platform.OS,
          current_version: currentVersion,
        },
      });

      console.log('✅ API Response:', response.data);
      const data = response.data;

      // مقایسه ورژن‌ها
      const needsUpdate = compareVersions(currentVersion, data.latest_version);
      console.log('📊 Comparison - Current:', currentVersion, 'Latest:', data.latest_version, 'Needs Update:', needsUpdate);

      if (needsUpdate) {
        const info = {
          current_version: currentVersion,
          latest_version: data.latest_version,
          minimum_version: data.minimum_version,
          force_update: data.force_update || false,
          android_url: data.android_url,
          ios_url: data.ios_url,
          description: data.description,
        };
        console.log('💾 Setting updateInfo:', info);
        setUpdateInfo(info);
        console.log('👁️ Setting showModal to true');
        setShowModal(true);
        
        // فقط زمانی timestamp ذخیره می‌کنیم که نسخه جدید باشد
        // تا دوباره بعد از 24 ساعت یادآوری بشه
        await AsyncStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
      } else {
        // اگر نسخه جدید نبود، timestamp رو پاک می‌کنیم
        // تا دفعه بعد دوباره چک بشه
        await AsyncStorage.removeItem(LAST_CHECK_KEY);
        
        // فقط وقتی چک دستی بود پیام بده
        if (forceCheck) {
          showToast('شما از آخرین نسخه اپلیکیشن استفاده می‌کنید ✅');
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Version check error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // فقط وقتی چک دستی بود پیام خطا بده
      if (forceCheck) {
        if (error.response) {
          showToast(`خطا در بررسی نسخه: ${error.response.status} - ${error.response.data?.message || 'خطای سرور'}`);
        } else if (error.request) {
          showToast('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
        } else {
          showToast('خطا در بررسی به‌روزرسانی: ' + error.message);
        }
      }
      
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🎬 useVersionCheck mounted - starting initial check');
    checkVersion();
  }, []);
  
  useEffect(() => {
    console.log('📢 useVersionCheck state changed - updateInfo:', updateInfo, 'showModal:', showModal);
  }, [updateInfo, showModal]);

  const closeModal = () => {
    if (updateInfo?.force_update) {
      // اگر آپدیت اجباری بود، نمیذاریم مودال بسته بشه
      return;
    }
    setShowModal(false);
  };

  const recheckVersion = () => {
    setLoading(true);
    checkVersion(true);
  };

  return {
    updateInfo,
    showModal,
    closeModal,
    loading,
    recheckVersion,
  };
};
