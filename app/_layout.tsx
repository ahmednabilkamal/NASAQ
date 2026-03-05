import { AuthProvider } from '@/config/authContext';
import { GenderProvider } from '@/config/genderContext';
import LanguageProvider from '@/config/languageRef';
import { Cairo_400Regular, Cairo_700Bold, useFonts } from '@expo-google-fonts/cairo';
import * as Localization from 'expo-localization';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, I18nManager } from 'react-native';
import React, { useEffect } from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';




SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Cairo_400Regular,
    Cairo_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const languageCode = Localization.getLocales()[0].languageTag.split('-')[0];

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: '#064E3B',
          backgroundColor: '#F0FDFA',
          height: 70,
          borderRadius: 15,
          borderLeftWidth: 10,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontFamily: 'Cairo_700Bold',
          color: '#064E3B',
          textAlign: I18nManager.isRTL ? 'right' : 'left'
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'Cairo_400Regular',
          color: '#374151',
          textAlign: I18nManager.isRTL ? 'right' : 'left'
        }}
        renderLeadingIcon={() => (
          <View style={{ justifyContent: 'center', paddingHorizontal: 15 }}>
            <Ionicons name="checkmark-circle" size={28} color="#064E3B" />
          </View>
        )}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: '#E11D48',
          backgroundColor: '#FFF1F2',
          height: 70,
          borderRadius: 15,
          borderLeftWidth: 10,
        }}
        text1Style={{
          fontSize: 16,
          fontFamily: 'Cairo_700Bold',
          color: '#E11D48',
          textAlign: I18nManager.isRTL ? 'right' : 'left'
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'Cairo_400Regular',
          color: '#374151',
          textAlign: I18nManager.isRTL ? 'right' : 'left'
        }}
        renderLeadingIcon={() => (
          <View style={{ justifyContent: 'center', paddingHorizontal: 15 }}>
            <Ionicons name="alert-circle" size={28} color="#E11D48" />
          </View>
        )}
      />
    ),
  };

  return (
    <LanguageProvider languageCode={languageCode}>
      <GenderProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="pages/login" />
            <Stack.Screen name="pages/verification" />
            <Stack.Screen name="pages/onboarding/page1" />
            <Stack.Screen name="pages/onboarding/page2" />
            <Stack.Screen name="pages/onboarding/page3" />
            <Stack.Screen name="pages/onboarding/page4" />
            <Stack.Screen name="pages/onboarding/page5" />
            <Stack.Screen name="pages/onboarding/page6" />
            <Stack.Screen name="pages/onboarding/page7" />
            <Stack.Screen name="pages/onboarding/page8" />
            <Stack.Screen name="pages/onboarding/page9" />
            <Stack.Screen name="pages/onboarding/page10" />
            <Stack.Screen name="pages/onboarding/page11" />
            <Stack.Screen name="pages/modal" />
            <Stack.Screen name="pages/tabs/homescreen" />
            <Stack.Screen name="pages/tabs/stylists" />
            <Stack.Screen name="pages/tabs/profile" />
            <Stack.Screen name="pages/tabs/chat" />
            <Stack.Screen name="pages/stylist_detail" />
            <Stack.Screen name="pages/chat" />
            <Stack.Screen name="pages/payment/add_card" />
            <Stack.Screen name="pages/contact_us" />
            <Stack.Screen name="pages/stylists/filter" options={{ presentation: 'modal' }} />
          </Stack>
          <Toast config={toastConfig} />
        </AuthProvider>
      </GenderProvider>
    </LanguageProvider>
  );
}
