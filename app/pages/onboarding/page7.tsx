import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGender } from '@/config/genderContext';


export default function GenderPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.genderSelection || (pageData as any)['en'].genderSelection;
    const { gender, setGender } = useGender();

    const [selected, setSelected] = useState<'male' | 'female' | null>(gender);

    useEffect(() => {
        if (selected) {
            setGender(selected);
        }
    }, [selected]);

    return (
        <SafeAreaView style={styles.container}>

            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={1}
                totalSteps={10}
                onNext={() => router.push('/pages/onboarding/page8' as any)}
                nextButtonText={content.nextButton}
            >
                <View >
                    <View style={styles.cardsRow}>
                        <TouchableOpacity
                            style={[styles.card, selected === 'male' && styles.cardSelected]}
                            onPress={() => setSelected('male')}
                        >
                            <View style={styles.avatarPlaceholder}>
                                <Image source={require('../../../assets/male.png')} style={styles.avatar} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.card, selected === 'female' && styles.cardSelected]}
                            onPress={() => setSelected('female')}
                        >
                            <View style={styles.avatarPlaceholder}>
                                <Image source={require('@/assets/female.png')} style={styles.avatar} />
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    placeholderText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        fontFamily: 'Cairo_400Regular',
    },
    avatar: {
        width: '100%',
        height: '100%',
    }
});
