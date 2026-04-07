import { useGender } from '@/config/genderContext';
import { useAuth } from '@/config/authContext';

export type OnboardingScreenStep =
    | 'gender'
    | 'height'
    | 'weight'
    | 'color'
    | 'shape'
    | 'measurements'
    | 'styles';

/**
 * Progress dots for the client onboarding path: both genders include measurements (7 total).
 */
export function useOnboardingProgress(screen: OnboardingScreenStep) {
    const { gender: ctxGender } = useGender();
    const { user } = useAuth();
    const gender =
        ctxGender ?? (user?.gender === 'male' || user?.gender === 'female' ? user.gender : null);
    const isMale = gender === 'male';
    const totalSteps = 7;

    const stepsFemale: Record<OnboardingScreenStep, number> = {
        gender: 1,
        height: 2,
        weight: 3,
        color: 4,
        shape: 5,
        measurements: 6,
        styles: 7,
    };
    const stepsMale: Record<OnboardingScreenStep, number> = {
        gender: 1,
        height: 2,
        weight: 3,
        color: 4,
        shape: 5,
        measurements: 6,
        styles: 7,
    };

    const map = isMale ? stepsMale : stepsFemale;
    return { currentStep: map[screen], totalSteps, isMale, gender };
}
