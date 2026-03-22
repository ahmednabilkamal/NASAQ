import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UnitToggle } from '@/components/onboarding/UnitToggle';
import { HeightSlider } from '@/components/onboarding/HeightSlider';
import { useHeightSelection } from '@/hooks/onboarding/useHeightSelection';
import { useAuth } from '@/config/authContext';
import { useGender } from '@/config/genderContext';
import { scale, scaleVertical } from '@/utils/responsive';
import { FontSizes } from '@/utils/typography';

export default function HeightPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.heightSelection || (pageData as any)['en'].heightSelection;

    const { unit, setUnit, height, panHandlers } = useHeightSelection();
    const { updateProfile } = useAuth();
    const { gender } = useGender();
    const [saving, setSaving] = useState(false);

    const characterImage = gender === 'male'
        ? require('../../../assets/maleheightcheck.png')
        : require('../../../assets/Frame 94.png');

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
        <SafeAreaView style={styles.container} edges={['top']}>
            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={2}
                totalSteps={7}


                onNext={handleNext}
                nextButtonText={saving ? '...' : content.nextButton}
            >
                <View style={styles.mainContent}>
                    <UnitToggle
                        unit={unit}
                        options={unitOptions}
                        onSelect={setUnit}
                    />

                    <View style={styles.heightDisplay}>
                        <Text style={styles.heightText}>{height}</Text>
                        <Text style={styles.heightUnit}>{unit}</Text>
                    </View>

                    <View style={styles.contentRow}>
                        <View style={styles.characterContainer}>
                            <Image
                                source={characterImage}
                                style={[
                                    styles.characterImage,
                                    { transform: [{ scale: (height / 170) * 0.85 }] }
                                ]}
                                resizeMode="contain"
                            />
                        </View>

                        <HeightSlider height={height} panHandlers={panHandlers} />
                    </View>
                </View>
            </EvaluationLayout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
    },
    heightDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: scaleVertical(10),
    },
    heightText: {
        fontSize: FontSizes.displayMedium,
        fontFamily: 'Cairo_700Bold',
    },
    heightUnit: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_400Regular',
        marginLeft: scale(5),
    },
    contentRow: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        paddingRight: scale(5),
    },
    characterContainer: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        marginRight: scale(-0),
    },
    characterImage: {
        width: scale(160),
        height: scaleVertical(280),
    },
});
