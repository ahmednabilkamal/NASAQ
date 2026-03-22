import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGenderSelection } from '@/hooks/onboarding/useGenderSelection';
import { useAuth } from '@/config/authContext';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, Shadows } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';

export default function GenderPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.genderSelection || (pageData as any)['en'].genderSelection;
    const { selected, setSelected } = useGenderSelection();
    const { updateProfile } = useAuth();
    const [saving, setSaving] = useState(false);

    const handleNext = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await updateProfile({ gender: selected });
            router.push('/pages/onboarding/heightSelection' as any);


        } catch (error) {
            console.error('Failed to save gender:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={1}
                totalSteps={7}
                onNext={handleNext}
                isNextDisabled={!selected}
                nextButtonText={saving ? '...' : content.nextButton}
            >

                <View>
                    <View style={styles.cardsRow}>
                        {/* Male first (left) */}
                        <TouchableOpacity
                            style={[styles.card, selected === 'male' && styles.cardSelected]}
                            onPress={() => setSelected('male')}
                        >
                            <View style={styles.avatarPlaceholder}>
                                <Image source={require('../../../assets/male.png')} style={styles.avatarMale} />
                            </View>
                        </TouchableOpacity>

                        {/* Female second (right) */}
                        <TouchableOpacity
                            style={[styles.card, selected === 'female' && styles.cardSelected]}
                            onPress={() => setSelected('female')}
                        >
                            <View style={styles.avatarPlaceholder}>
                                <Image source={require('@/assets/female.png')} style={styles.avatarFemale} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </EvaluationLayout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.xl,
    },
    card: {
        flex: 1,
        aspectRatio: 0.8,
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
        borderColor: 'transparent',
        padding: Spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.small,
    },
    cardSelected: {
        borderColor: '#000',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F9F9F9',
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarMale: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain',
    },
    avatarFemale: {
        width: '65%',
        height: '65%',
        resizeMode: 'contain',
    },
});
