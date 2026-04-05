/**
 * SafeAreaView wrapper.
 *
 * Native: I18nManager.forceRTL(true) flips layout. Client + stylist screens set
 * `userScreenDirection` / `stylistScreenDirection` (`config/rtlLayout.ts`) so rows stay RTL if Stack
 * drops inheritance. Web: root `direction: 'rtl'`, `dir="rtl"` on `documentElement`,
 * and the same stylist helper (RN-web’s I18nManager is a stub).
 *
 * This wrapper simply re-exports SafeAreaView so all screens import from one place.
 * If per-screen customization is needed in the future, add it here.
 */
import React from 'react';
import {
    SafeAreaView as RNSafeAreaView,
    type SafeAreaViewProps,
} from 'react-native-safe-area-context';

export function SafeAreaView(props: SafeAreaViewProps) {
    return <RNSafeAreaView {...props} />;
}

export default SafeAreaView;
