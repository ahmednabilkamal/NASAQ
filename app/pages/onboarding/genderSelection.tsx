import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { useGenderSelection } from '@/hooks/onboarding/useGenderSelection';
import { useAuth } from '@/config/authContext';
import { onboardingScreenDirection } from '@/config/rtlLayout';
import { ROUTES } from '@/constants/routes';

export default function GenderPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.genderSelection || (pageData as any)['ar'].genderSelection;
    const { selected, setSelected } = useGenderSelection();
    const { updateProfile } = useAuth();
    const [saving, setSaving] = useState(false);

    const handleNext = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await updateProfile({ gender: selected });
            router.push(ROUTES.onboarding.heightSelection as any);
        } catch (error) {
            console.error('Failed to save gender:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[styles.container, onboardingScreenDirection]}>
            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={1}
                totalSteps={7}
                onNext={handleNext}
                isNextDisabled={!selected}
                nextButtonText={saving ? '...' : content.nextButton}
                backRoute={ROUTES.onboarding.roleSelection}
            >
                <View style={styles.cardsWrap}>
                    <View style={styles.cardsRow}>
                        <TouchableOpacity
                            style={[styles.card, selected === 'male' && styles.cardSelected]}
                            onPress={() => setSelected('male')}
                        >
                            <View style={styles.avatarPlaceholder}>
                                <Image source={require('../../../assets/male.png')} style={styles.avatarMale} />
                            </View>
                        </TouchableOpacity>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    cardsWrap: {
        flex: 1,
        minHeight: 0,
        justifyContent: 'center',
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    card: {
        flex: 1,
        aspectRatio: 0.8,
        backgroundColor: '#FFF',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: 'transparent',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    cardSelected: {
        borderColor: '#000',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
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
