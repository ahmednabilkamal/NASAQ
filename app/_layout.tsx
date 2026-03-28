import { AuthProvider } from '@/config/authContext';
import { GenderProvider } from '@/config/genderContext';
import LanguageProvider from '@/config/languageRef';
import { Cairo_400Regular, Cairo_700Bold, useFonts } from '@expo-google-fonts/cairo';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import React, { useEffect } from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

/** No transition when switching main tab roots (bottom bar); other pushes keep default stack animation. */
const tabAnimationNone = { animation: 'none' as const };

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
          textAlign: 'right',
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'Cairo_400Regular',
          color: '#374151',
          textAlign: 'right',
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
          textAlign: 'right',
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: 'Cairo_400Regular',
          color: '#374151',
          textAlign: 'right',
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
    <LanguageProvider>
      <GenderProvider>
        <AuthProvider>
          <View style={{ flex: 1, direction: 'rtl' }}>
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
              <Stack.Screen name="pages/onboarding/genderSelection" />
              <Stack.Screen name="pages/onboarding/heightSelection" />
              <Stack.Screen name="pages/onboarding/weightSelection" />
              <Stack.Screen name="pages/onboarding/colorSelection" />
              <Stack.Screen name="pages/onboarding/bodyShape" />
              <Stack.Screen name="pages/onboarding/bodyMeasurement" />
              <Stack.Screen name="pages/onboarding/styleIdentity" />
              <Stack.Screen name="pages/tabs/homescreen" options={tabAnimationNone} />
              <Stack.Screen name="pages/tabs/stylists" options={tabAnimationNone} />
              <Stack.Screen name="pages/tabs/profile" options={tabAnimationNone} />
              <Stack.Screen name="pages/tabs/chat" options={tabAnimationNone} />
              <Stack.Screen name="pages/tabs/favorites" options={tabAnimationNone} />
              <Stack.Screen name="pages/orders" options={tabAnimationNone} />
              <Stack.Screen name="pages/stylist_detail" />
              <Stack.Screen name="pages/checkout" />
              <Stack.Screen name="pages/chat" />
              <Stack.Screen name="pages/notifications" />
              <Stack.Screen name="pages/payment/add_card" />
              <Stack.Screen name="pages/payment/cards" />
              <Stack.Screen name="pages/profile/edit" />
              <Stack.Screen name="pages/profile/change_password" />
              <Stack.Screen name="pages/contact_us" />
              <Stack.Screen name="pages/stylists/filter" options={{ presentation: 'modal' }} />
              <Stack.Screen name="pages/order_details" />
              <Stack.Screen name="pages/filter_modal_1" />
              <Stack.Screen name="pages/filter_modal_2" />
            </Stack>
          </View>
          <Toast config={toastConfig} />
        </AuthProvider>
      </GenderProvider>
    </LanguageProvider>
  );
}
