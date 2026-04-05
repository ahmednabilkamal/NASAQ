import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@venus_stylist_onboarding_cover_uri';

/** Persist cover URI — Expo Router query params truncate long file:// paths. */
export async function setStylistOnboardingCoverUri(uri: string | null): Promise<void> {
    if (uri && uri.trim()) {
        await AsyncStorage.setItem(KEY, uri.trim());
    } else {
        await AsyncStorage.removeItem(KEY);
    }
}

export async function getStylistOnboardingCoverUri(): Promise<string | null> {
    return AsyncStorage.getItem(KEY);
}

export async function clearStylistOnboardingCoverUri(): Promise<void> {
    await AsyncStorage.removeItem(KEY);
}
