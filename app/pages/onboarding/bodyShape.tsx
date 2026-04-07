import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { useGender } from '@/config/genderContext';
import { bodyTypeData } from '@/constants/theme';
import { useAuth } from '@/config/authContext';
import { onboardingScreenDirection } from '@/config/rtlLayout';
import { useOnboardingProgress } from '@/hooks/onboarding/useOnboardingProgress';
import { ROUTES } from '@/constants/routes';

export default function BodyShapePage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.bodyShape || (pageData as any)['ar'].bodyShape;
    const { gender } = useGender();

    const currentListData = gender === 'male' ? bodyTypeData.male : bodyTypeData.female;
    const [selected, setSelected] = useState<number | null>(null);
    const { updateProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const { currentStep, totalSteps, isMale } = useOnboardingProgress('shape');

    const handleNext = async () => {
        if (selected === null) return;
        setSaving(true);
        try {
            const shapeObj = currentListData.find((item) => item.key === selected);
            const shapeValue = shapeObj ? shapeObj.value : selected.toString();
            await updateProfile({ body_shape: shapeValue });
            router.push(
                ROUTES.onboarding.boyMeasurements as any
            );
        } catch (error) {
            console.error('Failed to save body shape:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[styles.screen, onboardingScreenDirection]}>
            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={handleNext}
                isNextDisabled={selected === null}
                nextButtonText={saving ? '...' : content.nextButton}
            >
                <View style={styles.grid}>
                    {currentListData.map((item) => (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.card, selected === item.key && styles.cardSelected]}
                            onPress={() => setSelected(item.key)}
                            activeOpacity={0.85}
                        >
                            <View style={styles.imageContainer}>
                                <Image source={item.source} style={styles.shapeImage} resizeMode="contain" />
                            </View>
                            <Text style={styles.shapeName} numberOfLines={1}>
                                Shape {item.key}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </EvaluationLayout>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    grid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignContent: 'flex-start',
    },
    card: {
        width: '31%',
        aspectRatio: 0.82,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardSelected: {
        borderColor: '#064E3B',
        backgroundColor: '#F0FDF4',
        elevation: 4,
    },
    imageContainer: {
        flex: 1,
        width: '100%',
        minHeight: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shapeImage: {
        width: '100%',
        height: '100%',
    },
    shapeName: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        fontFamily: 'Cairo_400Regular',
        marginTop: 4,
    },
});
