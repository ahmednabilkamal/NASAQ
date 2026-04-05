import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { UnitToggle } from '@/components/onboarding/UnitToggle';
import { HeightSlider } from '@/components/onboarding/HeightSlider';
import { useHeightSelection } from '@/hooks/onboarding/useHeightSelection';
import { useAuth } from '@/config/authContext';
import { useGender } from '@/config/genderContext';
import { onboardingScreenDirection } from '@/config/rtlLayout';
import { useOnboardingProgress } from '@/hooks/onboarding/useOnboardingProgress';

function formatHeightForUnit(cm: number, unit: 'cm' | 'ft'): string {
    if (unit === 'cm') {
        return String(cm);
    }
    const totalIn = cm / 2.54;
    const ft = Math.floor(totalIn / 12);
    const inch = Math.round(totalIn - ft * 12);
    return `${ft}'${inch}"`;
}

export default function HeightPage() {
    const router = useRouter();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.heightSelection || (pageData as any)['ar'].heightSelection;

    const { unit, setUnit, height, panHandlers, sliderWidth } = useHeightSelection();
    const { updateProfile } = useAuth();
    const { gender } = useGender();
    const { currentStep, totalSteps } = useOnboardingProgress('height');
    const [saving, setSaving] = useState(false);

    const characterImage =
        gender === 'male'
            ? require('../../../assets/maleheightcheck.png')
            : require('../../../assets/Frame 94.png');

    const displayValue = useMemo(() => formatHeightForUnit(height, unit), [height, unit]);
    const imageScale = useMemo(
        () => Math.min(1, Math.max(0.78, (height / 170) * 0.92)),
        [height]
    );

    const maxImageHeight = Math.min(168, Math.round(windowHeight * 0.2));
    const imageWidth = Math.min(180, Math.max(130, Math.min(windowWidth * 0.42, 200)));

    const handleNext = async () => {
        setSaving(true);
        try {
            await updateProfile({ height: Number(height) });
            router.push('/pages/onboarding/weightSelection' as any);
        } catch (error) {
            console.error('Failed to save height:', error);
        } finally {
            setSaving(false);
        }
    };

    const unitOptions = [
        { label: content.unitCm, value: 'cm' },
        { label: content.unitFt, value: 'ft' },
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

                    <View style={styles.characterContainer}>
                        <Image
                            source={characterImage}
                            style={[
                                styles.characterImage,
                                {
                                    width: imageWidth,
                                    height: maxImageHeight,
                                    transform: [{ scale: imageScale }],
                                },
                            ]}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.heightDisplay}>
                        <Text style={styles.heightText}>{displayValue}</Text>
                        <Text style={styles.heightUnit}>{unit === 'cm' ? content.unitCm : content.unitFt}</Text>
                    </View>

                    <View style={styles.sliderWrap}>
                        <HeightSlider
                            height={height}
                            panHandlers={panHandlers}
                            trackWidth={sliderWidth}
                            unit={unit}
                        />
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
        paddingTop: 4,
    },
    characterContainer: {
        minHeight: 148,
        maxHeight: 180,
        marginTop: 12,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    characterImage: {},
    heightDisplay: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginBottom: 20,
    },
    heightText: {
        fontSize: 44,
        fontFamily: 'Cairo_700Bold',
        color: '#111827',
        letterSpacing: -0.5,
    },
    heightUnit: {
        fontSize: 18,
        fontFamily: 'Cairo_600SemiBold',
        color: '#6b7280',
        marginStart: 10,
        marginBottom: 6,
    },
    sliderWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        paddingBottom: 8,
        width: '100%',
    },
});
