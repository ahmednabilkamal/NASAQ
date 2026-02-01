import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UnitToggle } from './components/UnitToggle';
import { BMISection } from './components/BMISection';
import { WeightSlider } from './components/WeightSlider';
import { useWeightSelection } from './hooks/useWeightSelection';

export default function WeightPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.weightSelection || (pageData as any)['en'].weightSelection;

    const { unit, setUnit, weight, panHandlers } = useWeightSelection();

    return (
        <SafeAreaView style={styles.container}>

            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={4}
                totalSteps={10}
                onNext={() => router.push('/pages/onboarding/page6' as any)}
                nextButtonText={content.nextButton}
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
        paddingTop: 20,
    },
    weightDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 40,
        justifyContent: 'center',
    },
    weightText: {
        fontSize: 48,
        fontFamily: 'Cairo_700Bold',
    },
    weightUnit: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        marginLeft: 10,
    },
});
