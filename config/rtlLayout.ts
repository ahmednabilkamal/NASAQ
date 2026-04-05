import type { ViewStyle } from 'react-native';

/**
 * Screen-root RTL. Use on `SafeAreaView` / main `View` so flex rows and `marginStart`/`End`
 * match Arabic after Expo Stack navigation.
 *
 * **Web:** Required — `I18nManager` is a stub.
 * **Native:** `I18nManager.forceRTL(true)` handles mirroring, but Stack/card roots sometimes
 * measure as LTR until this is set; keeping `direction: 'rtl'` on screen roots matches
 * how the app shipped and fixes login/register layout.
 */
export const stylistScreenDirection: ViewStyle = { direction: 'rtl' };

export const onboardingScreenDirection = stylistScreenDirection;

export const userScreenDirection = stylistScreenDirection;
