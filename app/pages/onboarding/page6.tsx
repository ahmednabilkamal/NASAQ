import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UnitToggle } from './components/UnitToggle';
import { HeightSlider } from './components/HeightSlider';
import { useHeightSelection } from './hooks/useHeightSelection';

export default function HeightPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.heightSelection || (pageData as any)['en'].heightSelection;

    const { unit, setUnit, height, panHandlers } = useHeightSelection();

    const unitOptions = [
        { label: content.unitCm, value: 'cm' },
        { label: content.unitFt, value: 'ft' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={5}
                totalSteps={10}
                onNext={() => router.push('/pages/onboarding/page7' as any)}
                nextButtonText={content.nextButton}
            >
                <View style={styles.container}>
                    <UnitToggle
                        unit={unit}
                        options={unitOptions}
                        onSelect={setUnit}
                    />

                    <View style={styles.visualContainer}>
                        <View style={styles.heightDisplay}>
                            <Text style={styles.heightText}>{height}</Text>
                            <Text style={styles.heightUnit}>{unit}</Text>
                        </View>

                        <View style={styles.contentRow}>
                            <View style={styles.characterContainer}>
                                <Image
                                    source={require('../../../assets/Frame 94.png')}
                                    style={[
                                        styles.characterImage,
                                        { transform: [{ scale: (height / 170) * 0.9 }] }
                                    ]}
                                    resizeMode="contain"
                                />
                            </View>

                            <HeightSlider height={height} panHandlers={panHandlers} />
                        </View>
                    </View>
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
    visualContainer: {
        flex: 1,
        width: '100%',
        position: 'relative',
    },
    heightDisplay: {
        position: 'absolute',
        top: 50,
        left: 10,
        flexDirection: 'row',
        alignItems: 'baseline',
        zIndex: 10,
    },
    heightText: {
        fontSize: 32,
        fontFamily: 'Cairo_700Bold',
    },
    heightUnit: {
        fontSize: 16,
        fontFamily: 'Cairo_400Regular',
        marginLeft: 5,
    },
    contentRow: {
        flexDirection: 'row',
        height: '100%',
    },
    characterContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
    },
    characterImage: {
        width: 180,
        height: 400,
    },
});
