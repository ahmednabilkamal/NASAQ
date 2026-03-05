import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGender } from '@/config/genderContext';
import { useAuth } from '@/config/authContext';

const TONES = {
    female: [
        { id: '1', name: 'Tone 1', value: 'light', image: require('../../../assets/femalecolor1.png') },
        { id: '2', name: 'Tone 2', value: 'fair', image: require('../../../assets/femalecolor2.png') },
        { id: '3', name: 'Tone 3', value: 'medium', image: require('../../../assets/femalecolor3.png') },
        { id: '4', name: 'Tone 4', value: 'tan', image: require('../../../assets/femalecolor4.png') },
    ],
    male: [
        { id: '1', name: 'Tone 1', value: 'light', image: require('../../../assets/malecolor1.png') },
        { id: '2', name: 'Tone 2', value: 'fair', image: require('../../../assets/malecolor2.png') },
        { id: '3', name: 'Tone 3', value: 'medium', image: require('../../../assets/malecolor3.png') },
        { id: '4', name: 'Tone 4', value: 'tan', image: require('../../../assets/malecolor4.png') },
    ]

};

export default function SkinTonePage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.skinTone || (pageData as any)['en'].skinTone;
    const { gender } = useGender();

    const [selected, setSelected] = useState<string | null>(null);
    const { updateProfile } = useAuth();
    const [saving, setSaving] = useState(false);

    const handleNext = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const tone = currentTones.find(t => t.id === selected)?.value || 'medium';
            await updateProfile({ skin_tones: tone });

            router.push('/pages/onboarding/bodyShape' as any);

        } catch (error) {
            console.error('Failed to save skin tone:', error);
        } finally {
            setSaving(false);
        }
    };

    // Get the appropriate tones based on gender
    const currentTones = gender === 'male' ? TONES.male : TONES.female;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={4}
                totalSteps={7}


                onNext={handleNext}
                nextButtonText={saving ? '...' : content.nextButton}
            >
                <View style={styles.container}>
                    <FlatList
                        data={currentTones}
                        numColumns={3}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.columnWrapper}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.card, selected === item.id && styles.cardSelected]}
                                onPress={() => setSelected(item.id)}
                            >
                                <View style={styles.imageContainer}>
                                    <Image source={item.image} style={styles.toneImage} resizeMode="contain" />
                                </View>
                                <Text style={styles.toneName}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </EvaluationLayout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'flex-start',
        gap: 15,
        marginBottom: 15,
    },
    card: {
        width: '30%',
        aspectRatio: 0.8,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardSelected: {
        borderColor: '#000',
    },
    imageContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    toneImage: {
        width: '100%',
        height: '100%',
    },
    toneName: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        fontFamily: 'Cairo_400Regular',
    }
});
