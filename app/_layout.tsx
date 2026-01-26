import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';
import LanguageProvider from '@/config/languageRef';
import * as Localization from 'expo-localization';



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
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="page1" />
        <Stack.Screen name="page2" />
        <Stack.Screen name="page3" />
        <Stack.Screen name="page4" />
      </Stack>
    </LanguageProvider>
  );
}

