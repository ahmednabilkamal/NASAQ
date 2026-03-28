import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '../../../components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService, { FashionStyle } from '@/config/apiService';
import { useAuth } from '@/config/authContext';
import { useGender } from '@/config/genderContext';

export default function StyleIdentityPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const { user, updateProfile } = useAuth();
    const { gender } = useGender();
    const content = (pageData as any)[languageCode]?.fashionIdentity || (pageData as any)['ar'].fashionIdentity;
    const isMale = gender === 'male' || user?.gender === 'male';


    const [styles_data, setStylesData] = useState<FashionStyle[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);

    const loadStyles = useCallback(async () => {
        setLoading(true);
        setLoadError(false);
        try {
            const res = await apiService.getFashionStyles({ per_page: 50 });
            const payload = res?.data;
            let styles = Array.isArray(payload) ? payload : [];

            // Ensure we have at least 6 items for the 3x2 grid mockup look
            if (styles.length > 0 && styles.length < 6) {
                const original = [...styles];
                while (styles.length < 6) {
                    styles = [...styles, ...original].slice(0, 6);
                }
            }
            setStylesData(styles);
            if (styles.length === 0) {
                setLoadError(true);
            }
        } catch (error) {
            console.error('Fashion styles fetch error:', error);
            setStylesData([]);
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStyles();
    }, [loadStyles]);

    const handleSelect = (index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleNext = async () => {
        if (selectedIndices.length === 0) return;

        setSaving(true);
        try {
            const selectedStyleIds = selectedIndices.map(idx => styles_data[idx].id);
            // Deduplicate IDs in case the same style was selected twice in different positions
            const uniqueIds = Array.from(new Set(selectedStyleIds.map(Number)));

            await updateProfile({ fashion_styles: uniqueIds });
            router.push('/pages/tabs/homescreen' as any);
        } catch (error) {
            console.error('Failed to save fashion styles:', error);
            router.push('/pages/tabs/homescreen' as any);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <EvaluationLayout
                title={content.title}
                subtitle={content.subtitle}
                currentStep={7}
                totalSteps={7}
                onNext={handleNext}
                nextButtonText={saving ? '...' : content.nextButton}
                isNextDisabled={selectedIndices.length === 0}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : loadError && styles_data.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            تعذر تحميل أنماط الموضة. تأكد أن الخادم يعمل ثم أعد المحاولة.
                        </Text>
                        <TouchableOpacity style={styles.retryButton} onPress={loadStyles} activeOpacity={0.8}>
                            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={styles_data}
                        numColumns={3}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.columnWrapper}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => {
                            const isSelected = selectedIndices.includes(index);

                            // Determine fallback images based on gender and column (3-column grid)
                            const colIndex = index % 3;
                            let defaultImage;

                            if (isMale) {
                                // Male: Side columns (0, 2) are black image 164, middle (1) is yellow image 163
                                defaultImage = (colIndex === 1)
                                    ? require('../../../assets/image 163.png')
                                    : require('../../../assets/image 164.png');
                            } else {
                                // Female: Side columns (0, 2) are denim stylewomen1, middle (1) is blazer stylewomen2
                                defaultImage = (colIndex === 1)
                                    ? require('../../../assets/stylewomen2.png')
                                    : require('../../../assets/stylewomen1.png');
                            }

                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.card,
                                        isSelected && styles.cardSelected
                                    ]}
                                    onPress={() => handleSelect(index)}
                                    activeOpacity={0.9}
                                >
                                    <Image
                                        source={item.image ? { uri: item.image } : defaultImage}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                    {isSelected && <View style={styles.selectedOverlay} />}
                                    <View style={styles.overlay}>
                                        <Text style={styles.styleName}>{item.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}
            </EvaluationLayout>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        fontFamily: 'Cairo_400Regular',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#111827',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontFamily: 'Cairo_600SemiBold',
    },
    listContent: {
        paddingTop: 10,
        paddingBottom: 40,
    },
    columnWrapper: {
        gap: 10,
        marginBottom: 10,
    },
    card: {
        width: '31%',
        aspectRatio: 0.8,
        borderRadius: 8,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cardSelected: {
        borderColor: '#FFB800',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    selectedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 184, 0, 0.2)',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
    },
    styleName: {
        fontSize: 10,
        color: '#FFF',
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
    },
});


