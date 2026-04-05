import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROUTES } from '@/constants/routes';

const ONBOARDING_COMPLETED_KEY = '@venus_onboarding_completed';
const ONBOARDING_STEP_KEY = '@venus_onboarding_step';

export const hasCompletedOnboarding = async (): Promise<boolean> => {
    try {
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        return completed === 'true';
    } catch (error) {
        console.error('Error checking onboarding status:', error);
        return false;
    }
};

export const setOnboardingCompleted = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
        console.log('✅ Onboarding marked as completed');
    } catch (error) {
        console.error('Error setting onboarding status:', error);
    }
};

export const saveOnboardingStep = async (step: number): Promise<void> => {
    try {
        await AsyncStorage.setItem(ONBOARDING_STEP_KEY, step.toString());
    } catch (error) {
        console.error('Error saving onboarding step:', error);
    }
};

export const getOnboardingStep = async (): Promise<number> => {
    try {
        const step = await AsyncStorage.getItem(ONBOARDING_STEP_KEY);
        return step ? parseInt(step, 10) : 1;
    } catch (error) {
        console.error('Error getting onboarding step:', error);
        return 1;
    }
};

export const resetOnboarding = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
        await AsyncStorage.removeItem(ONBOARDING_STEP_KEY);
        console.log('✅ Onboarding reset');
    } catch (error) {
        console.error('Error resetting onboarding:', error);
    }
};

export const isStylistVerified = (user: any): boolean => {
    return user?.role === 'stylist' && user?.stylist_verified === true;
};

const BOY_MEASUREMENT_KEYS = ['shoulder', 'chest', 'waist', 'arm', 'hip', 'thigh', 'leg'] as const;

/** Male clients: all measurement fields (cm), or explicit skip from the app. */
export const hasBoyMeasurementsComplete = (user: any): boolean => {
    if (!user || user.gender !== 'male') return true;
    const m = user.body_measurements;
    if (!m || typeof m !== 'object') return false;
    if (m.skipped === true || m.skipped === 1 || m.skipped === '1' || m.skipped === 'true') {
        return true;
    }
    return BOY_MEASUREMENT_KEYS.every((k) => {
        const v = m[k];
        const n = Number(v);
        return !Number.isNaN(n) && n > 0;
    });
};

export const isProfileComplete = (user: any): boolean => {
    if (!user) return false;

    if (isStylistUser(user)) return isStylistVerified(user);

    const hasStyles = user.fashion_styles && user.fashion_styles.length > 0;

    return !!(
        user.gender &&
        user.height &&
        user.weight &&
        user.skin_tones &&
        user.body_shape &&
        hasBoyMeasurementsComplete(user) &&
        hasStyles
    );
};

export const getNextOnboardingStep = (user: any): string => {
    if (!user) return ROUTES.onboarding.roleSelection;

    if (isStylistUser(user) && !isStylistVerified(user)) {
        return ROUTES.stylist.pendingVerification;
    }

    if (isStylistUser(user) && isStylistVerified(user)) return ROUTES.stylist.home;

    if (!user.gender) return ROUTES.onboarding.roleSelection;

    if (!user.height) return ROUTES.onboarding.heightSelection;
    if (!user.weight) return ROUTES.onboarding.weightSelection;
    if (!user.skin_tones) return ROUTES.onboarding.colorSelection;
    if (!user.body_shape) return ROUTES.onboarding.bodyShape;
    if (user.gender === 'male' && !hasBoyMeasurementsComplete(user)) {
        return ROUTES.onboarding.boyMeasurements;
    }
    const hasStyles = user.fashion_styles && user.fashion_styles.length > 0;
    if (!hasStyles) return ROUTES.onboarding.styleIdentity;
    return getHomeRoute(user);
};

export const isStylistUser = (user: any): boolean => {
    const r = user?.role;
    if (r == null || r === '') return false;
    return String(r).toLowerCase() === 'stylist';
};

export const getHomeRoute = (user: any): string => {
    if (isStylistUser(user) && !isStylistVerified(user)) {
        return ROUTES.stylist.pendingVerification;
    }
    return isStylistUser(user) ? ROUTES.stylist.home : ROUTES.tabs.homescreen;
};

export const getInitialRoute = async (isAuthenticated: boolean, user?: any): Promise<string> => {
    if (isAuthenticated) {
        if (!isProfileComplete(user)) {
            console.log('⚠️ Profile incomplete, directing to onboarding');
            return getNextOnboardingStep(user);
        }
        return getHomeRoute(user);
    }

    const completed = await hasCompletedOnboarding();
    if (completed) {
        return ROUTES.login;
    }

    return ROUTES.onboarding.page1;
};

export const clearAllAppData = async (): Promise<void> => {
    try {
        await AsyncStorage.clear();
        console.log('✅ All app data cleared');
    } catch (error) {
        console.error('Error clearing app data:', error);
    }
};

export default {
    hasCompletedOnboarding,
    setOnboardingCompleted,
    saveOnboardingStep,
    getOnboardingStep,
    resetOnboarding,
    getInitialRoute,
    clearAllAppData,
    isStylistVerified,
};
