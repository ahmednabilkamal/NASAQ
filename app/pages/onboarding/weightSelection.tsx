import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { UnitToggle } from '@/components/onboarding/UnitToggle';
import { BMISection } from '@/components/onboarding/BMISection';
import { WeightSlider } from '@/components/onboarding/WeightSlider';
import { useWeightSelection } from '@/hooks/onboarding/useWeightSelection';
import { useAuth } from '@/config/authContext';
import { onboardingScreenDirection } from '@/config/rtlLayout';
import { useOnboardingProgress } from '@/hooks/onboarding/useOnboardingProgress';

export default function WeightPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.weightSelection || (pageData as any)['ar'].weightSelection;

    const { unit, setUnit, weight, weightKg, panHandlers, sliderWidth } = useWeightSelection();
    const { user, updateProfile } = useAuth();
    const { currentStep, totalSteps } = useOnboardingProgress('weight');
    const [saving, setSaving] = useState(false);

    const heightCm = useMemo(() => {
        const h = Number(user?.height);
        return Number.isFinite(h) && h > 0 ? h : 170;
    }, [user?.height]);

    const handleNext = async () => {
        setSaving(true);
        try {
            // Always persist weight in KG (canonical) for correct BMI + backend.
            await updateProfile({ weight: Number(weightKg) });
            router.push('/pages/onboarding/colorSelection' as any);
        } catch (error) {
            console.error('Failed to save weight:', error);
        } finally {
            setSaving(false);
        }
    };

    const unitOptions = [
        { label: 'lbs', value: 'lbs' },
        { label: 'kg', value: 'kg' },
    ];

    return (
        <View style={[styles.screen, onboardingScreenDirection]}>
            <EvaluationLayout
                variant="measurement"
                title={content.title}
                subtitle={content.subtitle}
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={handleNext}
                nextButtonText={saving ? '...' : content.nextButton}
            >
                <View style={styles.fill}>
                    <UnitToggle compact unit={unit} options={unitOptions} onSelect={setUnit} />

                    <BMISection
                        compact
                        intro={content.bmiText}
                        categories={content.bmiCategories}
                        weight={weight}
                        unit={unit}
                        heightCm={heightCm}
                    />

                    <View style={styles.centerBlock}>
                        <View style={styles.weightDisplay}>
                            <Text style={styles.weightText}>{weight}</Text>
                            <Text style={styles.weightUnit}>{unit}</Text>
                        </View>

                        <View style={styles.sliderWrap}>
                            <WeightSlider weightKg={weightKg} unit={unit} panHandlers={panHandlers} trackWidth={sliderWidth} />
                        </View>
                    </View>
                </View>
            </EvaluationLayout>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    fill: {
        flex: 1,
        minHeight: 0,
        width: '100%',
        justifyContent: 'flex-start',
        paddingTop: 4,
    },
    centerBlock: {
        flex: 0,
        minHeight: 0,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 20,
        paddingBottom: 8,
    },
    weightDisplay: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginBottom: 20,
    },
    weightText: {
        fontSize: 44,
        fontFamily: 'Cairo_700Bold',
        color: '#111827',
        letterSpacing: -0.5,
    },
    weightUnit: {
        fontSize: 18,
        fontFamily: 'Cairo_600SemiBold',
        color: '#6b7280',
        marginBottom: 6,
        marginStart: 4,
    },
    sliderWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: 4,
    },
});
