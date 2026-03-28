import React, { useEffect, useMemo, useState } from 'react';
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

export default function WeightPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.weightSelection || (pageData as any)['ar'].weightSelection;

    const { unit, setUnit, weight, weightKg, panHandlers, sliderWidth } = useWeightSelection();
    const { user, updateProfile, refreshUser } = useAuth();
    const [saving, setSaving] = useState(false);

    const heightCm = useMemo(() => {
        const h = Number((user as any)?.height);
        return Number.isFinite(h) && h > 0 ? h : 170;
    }, [user]);

    useEffect(() => {
        // Ensure height is loaded before BMI calculation.
        if (user?.height == null || Number.isNaN(Number(user?.height))) {
            refreshUser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        <View style={styles.screen}>
            <EvaluationLayout
                variant="measurement"
                title={content.title}
                subtitle={content.subtitle}
                currentStep={3}
                totalSteps={7}
                onNext={handleNext}
                nextButtonText={saving ? '...' : content.nextButton}
            >
                <View style={styles.fill}>
                    <UnitToggle compact unit={unit} options={unitOptions} onSelect={setUnit} />

                    <BMISection
                        compact
                        title={content.bmiText}
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
    },
    fill: {
        flex: 1,
        minHeight: 0,
        width: '100%',
        justifyContent: 'flex-start',
    },
    centerBlock: {
        flex: 0,
        minHeight: 0,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
    },
    weightDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 8,
    },
    weightText: {
        fontSize: 36,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
    },
    weightUnit: {
        fontSize: 16,
        fontFamily: 'Cairo_600SemiBold',
        color: '#666',
        marginStart: 8,
    },
    sliderWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
});
