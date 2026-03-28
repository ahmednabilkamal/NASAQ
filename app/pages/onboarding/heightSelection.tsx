import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { UnitToggle } from '@/components/onboarding/UnitToggle';
import { HeightSlider, HEIGHT_SLIDER_TRACK_HEIGHT } from '@/components/onboarding/HeightSlider';
import { useHeightSelection } from '@/hooks/onboarding/useHeightSelection';
import { useAuth } from '@/config/authContext';
import { useGender } from '@/config/genderContext';

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

    const { unit, setUnit, height, panHandlers } = useHeightSelection();
    const { updateProfile } = useAuth();
    const { gender } = useGender();
    const [saving, setSaving] = useState(false);

    const characterImage =
        gender === 'male'
            ? require('../../../assets/maleheightcheck.png')
            : require('../../../assets/Frame 94.png');

    const displayValue = useMemo(() => formatHeightForUnit(height, unit), [height, unit]);
    const imageScale = useMemo(
        () => Math.min(1.05, Math.max(0.72, (height / 170) * 0.88)),
        [height]
    );

    const maxImageHeight = Math.min(200, Math.round(windowHeight * 0.22));
    const imageWidth = Math.min(190, Math.max(120, windowWidth * 0.4));

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
        <View style={styles.screen}>
            <EvaluationLayout
                variant="measurement"
                title={content.title}
                subtitle={content.subtitle}
                currentStep={2}
                totalSteps={7}
                onNext={handleNext}
                nextButtonText={saving ? '...' : content.nextButton}
            >
                <View style={styles.fill}>
                    <UnitToggle compact unit={unit} options={unitOptions} onSelect={setUnit} />

                    <View style={styles.heightDisplay}>
                        <Text style={styles.heightText}>{displayValue}</Text>
                        <Text style={styles.heightUnit}>{unit === 'cm' ? content.unitCm : content.unitFt}</Text>
                    </View>

                    <View style={styles.contentRow}>
                        <View style={styles.characterContainer}>
                            <Image
                                source={characterImage}
                                style={[
                                    styles.characterImage,
                                    {
                                        width: imageWidth,
                                        maxHeight: maxImageHeight,
                                        transform: [{ scale: imageScale }],
                                    },
                                ]}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.sliderColumn}>
                            <HeightSlider height={height} panHandlers={panHandlers} />
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
    },
    heightDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: 4,
    },
    heightText: {
        fontSize: 30,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
    },
    heightUnit: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#666',
        marginStart: 6,
    },
    contentRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 0,
        marginTop: 4,
        gap: 4,
    },
    characterContainer: {
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    characterImage: {
        height: undefined,
    },
    sliderColumn: {
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
        width: 80,
        minHeight: HEIGHT_SLIDER_TRACK_HEIGHT,
    },
});
