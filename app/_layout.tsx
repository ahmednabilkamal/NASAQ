import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';
import LanguageProvider from '@/config/languageRef';
import * as Localization from 'expo-localization';
import { GenderProvider } from '@/config/genderContext';
import { AuthProvider } from '@/config/authContext';



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
        </AuthProvider>
      </GenderProvider>
    </LanguageProvider>
  );
}
