import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    Modal,
    FlatList,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { onboardingScreenDirection } from '@/config/rtlLayout';
import { rtlInput, rtlText, rtlWritingMode } from '@/config/rtlText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';
import apiService, { FashionStyle } from '@/config/apiService';
import Toast from 'react-native-toast-message';
import { routeParamToString } from '@/utils/routeParams';

const EXPERIENCE_OPTIONS = [
    { label: 'أقل من سنة', value: '0' },
    { label: 'سنة - سنتين', value: '1' },
    { label: '3 - 5 سنوات', value: '3' },
    { label: '5 - 10 سنوات', value: '5' },
    { label: 'أكثر من 10 سنوات', value: '10' },
];

export default function StylistDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        tagline?: string;
        bio?: string;
    }>();

    const [hourlyPrice, setHourlyPrice] = useState('');
    const [experience, setExperience] = useState('');
    const [experienceLabel, setExperienceLabel] = useState('');
    const [selectedStyleId, setSelectedStyleId] = useState<number | null>(null);
    const [selectedStyleName, setSelectedStyleName] = useState('');

    const [fashionStyles, setFashionStyles] = useState<FashionStyle[]>([]);
    const [loadingStyles, setLoadingStyles] = useState(true);

    const [showExperiencePicker, setShowExperiencePicker] = useState(false);
    const [showStylePicker, setShowStylePicker] = useState(false);

    const loadFashionStyles = useCallback(async () => {
        setLoadingStyles(true);
        try {
            const res = await apiService.getFashionStyles({ per_page: 50 });
            const payload = res?.data;
            setFashionStyles(Array.isArray(payload) ? payload : []);
        } catch {
            setFashionStyles([]);
        } finally {
            setLoadingStyles(false);
        }
    }, []);

    useEffect(() => {
        loadFashionStyles();
    }, [loadFashionStyles]);

    const handleNext = () => {
        if (!hourlyPrice.trim()) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إدخال سعر الساعة' });
            return;
        }
        const price = parseFloat(hourlyPrice);
        if (isNaN(price) || price <= 0) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إدخال سعر صحيح' });
            return;
        }
        if (!experience) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى اختيار سنين الخبرة' });
            return;
        }
        if (!selectedStyleId) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى اختيار نوع الاستايل' });
            return;
        }

        router.push({
            pathname: '/pages/onboarding/stylistServices' as any,
            params: {
                tagline: routeParamToString(params.tagline),
                bio: routeParamToString(params.bio),
                hourlyPrice: hourlyPrice.trim(),
                experience,
                fashionStyleId: String(selectedStyleId),
            },
        } as any);
    };

    const canProceed = hourlyPrice.trim().length > 0 && experience.length > 0 && selectedStyleId !== null;

    return (
        <SafeAreaView style={[styles.container, onboardingScreenDirection]}>
            <OnboardingHeader
                currentStep={3}
                totalSteps={4}
                onBack={() => router.back()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>حدّد ستايلك وخدماتك</Text>
                    <Text style={styles.subtitle}>
                        اختار تخصصك وخبرتك وحدّد سعرك عشان توصلك{'\n'}الطلبات المناسبة.
                    </Text>

                    {/* Hourly Price */}
                    <Text style={styles.fieldLabel}>
                        سعر الساعة <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="اكتب هنا.."
                            placeholderTextColor="#B0B0B0"
                            value={hourlyPrice}
                            onChangeText={setHourlyPrice}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Years of Experience */}
                    <Text style={styles.fieldLabel}>
                        سنين الخبرة <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.dropdownContainer}
                        onPress={() => setShowExperiencePicker(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-down" size={20} color="#999" />
                        <Text style={[styles.dropdownText, !experienceLabel && styles.dropdownPlaceholder]}>
                            {experienceLabel || 'أختر سنين الخبرة'}
                        </Text>
                    </TouchableOpacity>

                    {/* Style Type */}
                    <Text style={styles.fieldLabel}>
                        نوع الاستايل <Text style={styles.required}>*</Text>
                    </Text>
                    {loadingStyles ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color="#000" />
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.dropdownContainer}
                            onPress={() => setShowStylePicker(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-down" size={20} color="#999" />
                            <Text style={[styles.dropdownText, !selectedStyleName && styles.dropdownPlaceholder]}>
                                {selectedStyleName || 'أختر نوع الاستايل'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
                    onPress={handleNext}
                    disabled={!canProceed}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.nextButtonText, !canProceed && styles.nextButtonTextDisabled]}>
                        التالي
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Experience Picker Modal */}
            <Modal visible={showExperiencePicker} transparent animationType="slide">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowExperiencePicker(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>سنين الخبرة</Text>
                        {EXPERIENCE_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.value}
                                style={[
                                    styles.modalOption,
                                    experience === opt.value && styles.modalOptionSelected,
                                ]}
                                onPress={() => {
                                    setExperience(opt.value);
                                    setExperienceLabel(opt.label);
                                    setShowExperiencePicker(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalOptionText,
                                        experience === opt.value && styles.modalOptionTextSelected,
                                    ]}
                                >
                                    {opt.label}
                                </Text>
                                {experience === opt.value && (
                                    <Ionicons name="checkmark" size={20} color="#0a7ea4" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Style Picker Modal */}
            <Modal visible={showStylePicker} transparent animationType="slide">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowStylePicker(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>نوع الاستايل</Text>
                        <FlatList
                            data={fashionStyles}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalOption,
                                        selectedStyleId === Number(item.id) && styles.modalOptionSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedStyleId(Number(item.id));
                                        setSelectedStyleName(item.name);
                                        setShowStylePicker(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.modalOptionText,
                                            selectedStyleId === Number(item.id) && styles.modalOptionTextSelected,
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                    {selectedStyleId === Number(item.id) && (
                                        <Ionicons name="checkmark" size={20} color="#0a7ea4" />
                                    )}
                                </TouchableOpacity>
                            )}
                            style={{ maxHeight: 300 }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 30,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 10,
        ...rtlWritingMode,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
        ...rtlWritingMode,
    },
    fieldLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        marginBottom: 10,
        ...rtlText.alignStart,
        ...rtlWritingMode,
    },
    required: {
        color: '#E11D48',
    },
    inputContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 14,
        height: 52,
        justifyContent: 'center',
        paddingHorizontal: 18,
        marginBottom: 22,
    },
    input: {
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
        ...rtlInput,
    },
    dropdownContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 14,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        marginBottom: 22,
    },
    dropdownText: {
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
        flex: 1,
        ...rtlText.alignStart,
        ...rtlWritingMode,
    },
    dropdownPlaceholder: {
        color: '#B0B0B0',
    },
    loadingRow: {
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 22,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
        paddingTop: 12,
    },
    nextButton: {
        backgroundColor: '#000',
        height: 56,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonDisabled: {
        backgroundColor: '#CCC',
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
    },
    nextButtonTextDisabled: {
        color: '#999',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalOptionSelected: {
        backgroundColor: '#F0FAFF',
        borderRadius: 10,
        borderBottomColor: 'transparent',
        paddingHorizontal: 12,
    },
    modalOptionText: {
        fontSize: 16,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
        flex: 1,
        ...rtlText.alignStart,
        ...rtlWritingMode,
    },
    modalOptionTextSelected: {
        fontFamily: 'Cairo_700Bold',
        color: '#0a7ea4',
    },
});
