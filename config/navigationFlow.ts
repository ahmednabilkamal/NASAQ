import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = '@venus_onboarding_completed';
const ONBOARDING_STEP_KEY = '@venus_onboarding_step';

/**
 * Navigation Flow Manager
 * Handles the app navigation flow: Splash → Onboarding → Login → Main App
 */

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
    try {
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        return completed === 'true';
    } catch (error) {
        console.error('Error checking onboarding status:', error);
        return false;
    }
};

/**
 * Mark onboarding as completed
 */
export const setOnboardingCompleted = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
        console.log('✅ Onboarding marked as completed');
    } catch (error) {
        console.error('Error setting onboarding status:', error);
    }
};

/**
 * Save current onboarding step (1, 2, or 3)
 */
export const saveOnboardingStep = async (step: number): Promise<void> => {
    try {
        await AsyncStorage.setItem(ONBOARDING_STEP_KEY, step.toString());
    } catch (error) {
        console.error('Error saving onboarding step:', error);
    }
};

/**
 * Get current onboarding step
 */
export const getOnboardingStep = async (): Promise<number> => {
    try {
        const step = await AsyncStorage.getItem(ONBOARDING_STEP_KEY);
        return step ? parseInt(step, 10) : 1;
    } catch (error) {
        console.error('Error getting onboarding step:', error);
        return 1;
    }
};

/**
 * Reset onboarding (for testing or re-onboarding)
 */
export const resetOnboarding = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
        await AsyncStorage.removeItem(ONBOARDING_STEP_KEY);
        console.log('✅ Onboarding reset');
    } catch (error) {
        console.error('Error resetting onboarding:', error);
    }
};

/**
 * Determine the initial route based on app state
 * @param isAuthenticated - Whether user is authenticated
 * @returns The route to navigate to
 */
export const getInitialRoute = async (isAuthenticated: boolean): Promise<string> => {
    // Start directly from onboarding page1
    return '/pages/onboarding/page1';
};

/**
 * Clear all app data (for logout or reset)
 */
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
