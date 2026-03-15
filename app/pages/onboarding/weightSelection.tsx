import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UnitToggle } from '@/components/onboarding/UnitToggle';
import { BMISection } from '@/components/onboarding/BMISection';
import { WeightSlider } from '@/components/onboarding/WeightSlider';
import { useWeightSelection } from '@/hooks/onboarding/useWeightSelection';
import { useAuth } from '@/config/authContext';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';

export default function WeightPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.weightSelection || (pageData as any)['en'].weightSelection;

    const { unit, setUnit, weight, panHandlers } = useWeightSelection();
    const { updateProfile } = useAuth();
    const [saving, setSaving] = useState(false);

    const handleNext = async () => {
        setSaving(true);
        try {
            // Convert weight if needed or just send it
            await updateProfile({ weight: Number(weight) });
            router.push('/pages/onboarding/colorSelection' as any);

        } catch (error) {
            console.error('Failed to save weight:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={3}
                totalSteps={7}


                onNext={handleNext}
                nextButtonText={saving ? '...' : content.nextButton}
            >
                <View style={{ flex: 1 }}>
                    <UnitToggle
                        unit={unit}
                        options={[{ label: 'lbs', value: 'lbs' }, { label: 'kg', value: 'kg' }]}
                        onSelect={setUnit}
                    />

                    <BMISection
                        title={content.bmiText}
                        categories={content.bmiCategories}
                        weight={weight}
                        unit={unit}
                    />

                    <View style={styles.weightDisplay}>
                        <Text style={styles.weightText}>{weight}</Text>
                        <Text style={styles.weightUnit}>{unit.toUpperCase()}</Text>
                    </View>

                    <WeightSlider weight={weight} panHandlers={panHandlers} />
                </View>
            </EvaluationLayout>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: scaleVertical(20),
    },
    weightDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: scaleVertical(40),
        justifyContent: 'center',
    },
    weightText: {
        fontSize: FontSizes.display,
        fontFamily: 'Cairo_700Bold',
    },
    weightUnit: {
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        marginLeft: scale(10),
    },
});
