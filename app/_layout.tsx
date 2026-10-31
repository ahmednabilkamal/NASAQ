import { AuthProvider } from '@/config/authContext';
import { ChatUnreadProvider } from '@/providers/ChatUnreadProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { GenderProvider } from '@/config/genderContext';
import LanguageProvider from '@/config/languageRef';
import { Cairo_400Regular, Cairo_700Bold, useFonts } from '@expo-google-fonts/cairo';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, I18nManager, Platform } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppToast } from '@/components/AppToastConfig';
import { colors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync();

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const tabAnimationNone = { animation: 'none' as const };

/** Native stack: RTL should push from the “end” (left), not the default LTR-from-right. */
const stackAnimation =          ('slide_from_left' as const)

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

    useEffect(() => {
        if (Platform.OS !== 'web' || typeof document === 'undefined') return;
        document.documentElement.setAttribute('dir', 'rtl');
        document.body?.setAttribute('dir', 'rtl');
    }, []);

    if (!loaded && !error) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <LanguageProvider>
                <GenderProvider>
                    <AuthProvider>
                        <ChatUnreadProvider>
                        <NotificationProvider>
                            <View
                                style={[{ flex: 1 }, Platform.OS === 'web' ? { direction: 'rtl' } : null]}
                            >
                                <Stack
                                    screenOptions={{
                                        headerShown: false,
                                        ...(stackAnimation ? { animation: stackAnimation } : {}),
                                        contentStyle: {
                                            backgroundColor: colors.surface.background,
                                            direction: 'rtl',
                                        },
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
                                    <Stack.Screen name="pages/onboarding/boyMeasurements" />
                                    <Stack.Screen name="pages/onboarding/styleIdentity" />
                                    <Stack.Screen name="pages/onboarding/roleSelection" />
                                    <Stack.Screen name="pages/onboarding/stylistProfile" />
                                    <Stack.Screen name="pages/onboarding/stylistDetails" />
                                    <Stack.Screen name="pages/onboarding/stylistServices" />
                                    <Stack.Screen name="pages/tabs/homescreen" options={tabAnimationNone} />
                                    <Stack.Screen name="pages/tabs/stylists" options={tabAnimationNone} />
                                    <Stack.Screen name="pages/tabs/profile" options={tabAnimationNone} />
                                    <Stack.Screen name="pages/tabs/chat" options={tabAnimationNone} />
                                    <Stack.Screen name="pages/tabs/favorites" options={tabAnimationNone} />
                                    <Stack.Screen name="pages/orders" options={tabAnimationNone} />
                                    <Stack.Screen name="pages/stylist/home" options={tabAnimationNone} />
                                    <Stack.Screen name="pages/stylist/pending_verification" />
                                    <Stack.Screen name="pages/stylist/orders" options={tabAnimationNone} />
                                    <Stack.Screen name="pages/stylist/services" options={tabAnimationNone} />
                                    <Stack.Screen name="pages/stylist/earnings" options={tabAnimationNone} />
                                    <Stack.Screen name="pages/stylist/edit_profile" />
                                    <Stack.Screen name="pages/stylist_detail" />
                                    <Stack.Screen name="pages/checkout" />
                                    <Stack.Screen name="pages/chat" />
                                    <Stack.Screen name="pages/notifications" />
                                    <Stack.Screen name="pages/settings/privacy" />
                                    <Stack.Screen name="pages/settings/terms" />
                                    <Stack.Screen name="pages/settings/notifications" />
                                    <Stack.Screen name="pages/payment/add_card" />
                                    <Stack.Screen name="pages/payment/cards" />
                                    <Stack.Screen name="pages/profile/edit" />
                                    <Stack.Screen name="pages/profile/change_password" />
                                    <Stack.Screen name="pages/profile/delete_account" />
                                    <Stack.Screen name="pages/contact_us" />
                                    <Stack.Screen name="pages/tickets" />
                                    <Stack.Screen name="pages/ticket_new" />
                                    <Stack.Screen name="pages/ticket_detail" />
                                    <Stack.Screen name="pages/stylists/filter" options={{ presentation: 'modal' }} />
                                    <Stack.Screen name="pages/order_details" />
                                    <Stack.Screen name="pages/stylists/filterWizardStep1" />
                                    <Stack.Screen name="pages/stylists/filterWizardStep2" />
                                </Stack>
                            </View>
                            <AppToast />
                        </NotificationProvider>
                        </ChatUnreadProvider>
                    </AuthProvider>
                </GenderProvider>
            </LanguageProvider>
        </SafeAreaProvider>
    );
}
