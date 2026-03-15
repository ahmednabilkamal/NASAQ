import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const isProfileComplete = (user: any): boolean => {
    if (!user) return false;

    const hasMeasurements = user.body_measurements && Object.keys(user.body_measurements).length > 0;
    const hasStyles = user.fashion_styles && user.fashion_styles.length > 0;

    return !!(user.gender && user.height && user.weight && user.skin_tones && user.body_shape && hasMeasurements && hasStyles);
};

export const getNextOnboardingStep = (user: any): string => {
    if (!user) return '/pages/onboarding/genderSelection';
    if (!user.gender) return '/pages/onboarding/genderSelection';
    if (!user.height) return '/pages/onboarding/heightSelection';
    if (!user.weight) return '/pages/onboarding/weightSelection';
    if (!user.skin_tones) return '/pages/onboarding/colorSelection';
    if (!user.body_shape) return '/pages/onboarding/bodyShape';
    const hasMeasurements = user.body_measurements && Object.keys(user.body_measurements).length > 0;
    if (!hasMeasurements) return '/pages/onboarding/bodyMeasurement';
    const hasStyles = user.fashion_styles && user.fashion_styles.length > 0;
    if (!hasStyles) return '/pages/onboarding/styleIdentity';
    return '/pages/tabs/homescreen';
};

export const getInitialRoute = async (isAuthenticated: boolean, user?: any): Promise<string> => {
    if (isAuthenticated) {
        if (!isProfileComplete(user)) {
            console.log('⚠️ Profile incomplete, directing to onboarding');
            return getNextOnboardingStep(user);
        }
        return '/pages/tabs/homescreen';
    }

    const completed = await hasCompletedOnboarding();
    if (completed) {
        return '/pages/login';
    }

    return '/pages/onboarding/page1';
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
};
