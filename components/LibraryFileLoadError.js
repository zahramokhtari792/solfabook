import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../context/ThemeProvider';

/** Show a terminal error instead of leaving a media reader on an endless loader. */
export default function LibraryFileLoadError({ error, onRetry }) {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const status = error?.response?.status;
  const apiMessage = error?.response?.data?.message;
  const message = status === 401 || status === 403
    ? 'اعتبار اشتراک یا دسترسی شما پایان یافته است. وضعیت اشتراک را بررسی کنید.'
    : status === 409
      ? 'دسترسی به این فایل ثبت نشده است. لطفاً صفحه کتابخانه را تازه‌سازی کنید.'
      : (typeof apiMessage === 'string' && apiMessage.trim())
        ? apiMessage
        : (error?.message || 'دریافت فایل با خطا مواجه شد.');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 24 }}>
      <View style={{ alignItems: 'center', gap: 16 }}>
        <Text style={{ color: colors.text, fontFamily: 'VazirBold', fontSize: 16, textAlign: 'center', lineHeight: 30 }}>
          {message}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onRetry?.()}
          style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: colors.primary }}
        >
          <Text style={{ color: colors.onPrimary, fontFamily: 'VazirBold', textAlign: 'center' }}>تلاش مجدد</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => navigation.goBack()} style={{ padding: 12 }}>
          <Text style={{ color: colors.text, fontFamily: 'VazirBold' }}>بازگشت</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
