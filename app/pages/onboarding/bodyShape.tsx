import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGender } from '@/config/genderContext';
import { bodyTypeData } from '@/constants/theme';
import { useAuth } from '@/config/authContext';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';

export default function BodyShapePage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.bodyShape || (pageData as any)['en'].bodyShape;
    const { gender } = useGender();

    const currentListData = gender === "male" ? bodyTypeData.male : bodyTypeData.female;
    const [selected, setSelected] = useState<number | null>(null);
    const { updateProfile } = useAuth();
    const [saving, setSaving] = useState(false);

    const handleNext = async () => {
        if (selected === null) return;
        setSaving(true);
        try {
            const shapeObj = currentListData.find(item => item.key === selected);
            const shapeValue = shapeObj ? shapeObj.value : selected.toString();
            await updateProfile({ body_shape: shapeValue });
            router.push('/pages/onboarding/bodyMeasurement' as any);
        } catch (error) {
            console.error('Failed to save body shape:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={5}
                totalSteps={7}

                onNext={handleNext}
                nextButtonText={saving ? '...' : content.nextButton}
            >
                <View style={styles.container}>
                    <FlatList
                        data={currentListData}
                        numColumns={3}
                        keyExtractor={(item) => item.key.toString()}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.columnWrapper}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.card, selected === item.key && styles.cardSelected]}
                                onPress={() => setSelected(item.key)}
                            >
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={item.source}
                                        style={styles.shapeImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text style={styles.shapeName}>Shape {item.key}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </EvaluationLayout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: scaleVertical(20),
    },
    columnWrapper: {
        justifyContent: 'flex-start',
        gap: scale(15),
        marginBottom: scaleVertical(15),
    },
    card: {
        width: '30%',
        aspectRatio: 0.8,
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.cardSmall,
        borderWidth: scale(2),
        borderColor: 'transparent',
        padding: scale(8),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: 0.05,
        shadowRadius: scale(4),
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
        marginBottom: scale(4),
    },
    shapeImage: {
        width: '100%',
        height: '100%',
    },
    shapeName: {
        fontSize: FontSizes.caption,
        color: '#666',
        textAlign: 'center',
        fontFamily: 'Cairo_400Regular',
    }
});
