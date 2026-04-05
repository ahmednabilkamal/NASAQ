import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { onboardingScreenDirection } from '@/config/rtlLayout';
import { rtlInput, rtlText, rtlWritingMode } from '@/config/rtlText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import apiService, { Category } from '@/config/apiService';
import api from '@/config/axios';
import { useAuth } from '@/config/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    appendImageFieldToFormData,
    isLocalImageUri,
    MAX_STYLIST_IMAGE_BYTES,
} from '@/utils/imageUploadFormData';
import { routeParamToString } from '@/utils/routeParams';
import {
    clearStylistOnboardingCoverUri,
    getStylistOnboardingCoverUri,
} from '@/utils/stylistOnboardingCoverStorage';
import { ensureUploadableImageUri } from '@/utils/ensureUploadableImageUri';

interface ServiceForm {
    title: string;
    price: string;
    duration: string;
}

const EMPTY_SERVICE: ServiceForm = { title: '', price: '', duration: '' };

/** Must match CompleteStylistRequest `portfolio_images` max. */
const MAX_PORTFOLIO_IMAGES = 20;

export default function StylistServicesScreen() {
    const router = useRouter();
    const { refreshUser, user } = useAuth();
    const params = useLocalSearchParams<{
        coverImage?: string;
        tagline?: string;
        bio?: string;
        hourlyPrice?: string;
        experience?: string;
        fashionStyleId?: string;
    }>();

    const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
    const [services, setServices] = useState<ServiceForm[]>([{ ...EMPTY_SERVICE }]);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        apiService.getCategories().then((res) => {
            const cats = res?.data;
            if (Array.isArray(cats)) setCategories(cats);
        }).catch(() => { });
    }, []);

    const pickPortfolioImage = async (useCamera: boolean) => {
        try {
            if (portfolioImages.length >= MAX_PORTFOLIO_IMAGES) {
                Toast.show({
                    type: 'error',
                    text1: 'الحد الأقصى',
                    text2: `يمكنك إضافة حتى ${MAX_PORTFOLIO_IMAGES} صورة في المعرض`,
                });
                return;
            }

            const permissionResult = useCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى السماح بالوصول للصور' });
                return;
            }

            const result = useCamera
                ? await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                });

            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                const fileSize = asset.fileSize ?? 0;
                if (fileSize > 0 && fileSize > MAX_STYLIST_IMAGE_BYTES) {
                    Toast.show({
                        type: 'error',
                        text1: 'خطأ',
                        text2: 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)',
                    });
                    return;
                }
                const readyUri = await ensureUploadableImageUri(asset.uri);
                setPortfolioImages((prev) => [...prev, readyUri]);
            }
        } catch {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'فشل في اختيار الصورة' });
        }
    };

    const showPortfolioImageOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['إلغاء', 'التقاط صورة', 'اختيار من الاستوديو'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) pickPortfolioImage(true);
                    else if (buttonIndex === 2) pickPortfolioImage(false);
                }
            );
        } else {
            pickPortfolioImage(false);
        }
    };

    const removePortfolioImage = (index: number) => {
        setPortfolioImages((prev) => prev.filter((_, i) => i !== index));
    };

    const updateService = (index: number, field: keyof ServiceForm, value: string) => {
        setServices((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const addService = () => {
        setServices((prev) => [...prev, { ...EMPTY_SERVICE }]);
    };

    const removeService = (index: number) => {
        if (services.length <= 1) return;
        setServices((prev) => prev.filter((_, i) => i !== index));
    };

    const validateServices = (): boolean => {
        for (let i = 0; i < services.length; i++) {
            const s = services[i];
            if (!s.title.trim()) {
                Toast.show({ type: 'error', text1: 'خطأ', text2: `يرجى إدخال اسم الخدمة ${i + 1}` });
                return false;
            }
            if (!s.price.trim() || isNaN(parseFloat(s.price)) || parseFloat(s.price) <= 0) {
                Toast.show({ type: 'error', text1: 'خطأ', text2: `يرجى إدخال سعر صحيح للخدمة ${i + 1}` });
                return false;
            }
            if (!s.duration.trim() || isNaN(parseFloat(s.duration)) || parseFloat(s.duration) <= 0) {
                Toast.show({ type: 'error', text1: 'خطأ', text2: `يرجى إدخال مدة صحيحة للخدمة ${i + 1}` });
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateServices()) return;

        setSubmitting(true);
        try {
            // Step 1: Complete stylist profile — use POST + multipart for local cover (PHP / PUT + files is unreliable).
            const storedCover = await getStylistOnboardingCoverUri();
            const paramCover = routeParamToString(params.coverImage).trim();
            const coverUriRaw = (storedCover && storedCover.trim()) || paramCover;
            const coverUri = coverUriRaw || null;
            const hasLocalCover = isLocalImageUri(coverUri);
            const hasLocalPortfolio = portfolioImages.some((u) => isLocalImageUri(u));
            const useMultipart = hasLocalCover || hasLocalPortfolio;

            const tagline = routeParamToString(params.tagline);
            const bio = routeParamToString(params.bio);
            const fashionStyleId = routeParamToString(params.fashionStyleId);

            if (useMultipart) {
                const formData = new FormData();
                if (user?.name) formData.append('name', user.name);
                if (tagline) formData.append('bio', tagline);
                if (bio) formData.append('about', bio);
                if (fashionStyleId) {
                    formData.append('fashion_style_ids[]', fashionStyleId);
                }
                if (hasLocalCover && coverUri) {
                    const uploadUri = await ensureUploadableImageUri(coverUri);
                    appendImageFieldToFormData(formData, 'cover', uploadUri);
                } else if (coverUri && !isLocalImageUri(coverUri)) {
                    formData.append('cover', coverUri);
                }
                for (const uri of portfolioImages) {
                    if (!isLocalImageUri(uri)) continue;
                    const uploadUri = await ensureUploadableImageUri(uri);
                    appendImageFieldToFormData(formData, 'portfolio_images[]', uploadUri);
                }
                await api.post('/user/stylist/profile', formData);
            } else {
                const profilePayload: Record<string, unknown> = {};
                if (user?.name) profilePayload.name = user.name;
                if (tagline) profilePayload.bio = tagline;
                if (bio) profilePayload.about = bio;
                if (fashionStyleId) {
                    profilePayload.fashion_style_ids = [Number(fashionStyleId)];
                }
                if (coverUri && !isLocalImageUri(coverUri)) {
                    profilePayload.cover = coverUri;
                }
                await api.put('/user/stylist/profile', profilePayload);
            }

            // Step 2: Create services via POST /user/stylist/services
            const defaultCategoryId = categories.length > 0 ? Number(categories[0].id) : 1;

            for (const service of services) {
                await apiService.createStylistService({
                    title: service.title.trim(),
                    price: parseFloat(service.price),
                    category_id: defaultCategoryId,
                    available: true,
                });
            }

            // Mark stylist onboarding as done
            await AsyncStorage.setItem('@venus_stylist_onboarding_completed', 'true');

            // Refresh user to pick up the new role
            await refreshUser();

            Toast.show({
                type: 'success',
                text1: 'تم بنجاح',
                text2: 'تم إعداد حسابك كمنسّق أزياء',
            });

            await clearStylistOnboardingCoverUri();
            router.replace('/pages/stylist/pending_verification' as any);
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب';
            Toast.show({ type: 'error', text1: 'خطأ', text2: msg });
        } finally {
            setSubmitting(false);
        }
    };

    const hasValidService = services.some(
        (s) => s.title.trim() && s.price.trim() && s.duration.trim()
    );

    return (
        <SafeAreaView style={[styles.container, onboardingScreenDirection]}>
            <OnboardingHeader
                currentStep={3}
                totalSteps={3}
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
                    <Text style={styles.title}>ظبّط مواعيدك المتاحة</Text>
                    <Text style={styles.subtitle}>
                        أضف خدماتك ومعرض أعمالك عشان العميل يشوف{'\n'}شغلك ويختارك بسهولة.
                    </Text>

                    {/* Portfolio Section */}
                    <Text style={styles.sectionTitle}>معرض الأعمال</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.portfolioRow}
                        style={styles.portfolioScroll}
                    >
                        <TouchableOpacity
                            style={styles.addPortfolioButton}
                            onPress={showPortfolioImageOptions}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={28} color="#0a7ea4" />
                        </TouchableOpacity>

                        {portfolioImages.map((uri, index) => (
                            <View key={`${uri}-${index}`} style={styles.portfolioImageWrapper}>
                                <Image source={{ uri }} style={styles.portfolioImage} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removePortfolioImage(index)}
                                >
                                    <Ionicons name="close-circle" size={22} color="#E11D48" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Services Section */}
                    <View style={styles.servicesHeader}>
                        <TouchableOpacity onPress={addService} activeOpacity={0.7}>
                            <Text style={styles.addServiceText}>إضافة خدمة</Text>
                        </TouchableOpacity>
                        <Text style={styles.sectionTitle}>الخدمات</Text>
                    </View>

                    {services.map((service, index) => (
                        <View key={index} style={styles.serviceCard}>
                            {services.length > 1 && (
                                <TouchableOpacity
                                    style={styles.removeServiceButton}
                                    onPress={() => removeService(index)}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#E11D48" />
                                </TouchableOpacity>
                            )}

                            <Text style={styles.fieldLabel}>
                                إسم الخدمة <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="اكتب هنا.."
                                    placeholderTextColor="#B0B0B0"
                                    value={service.title}
                                    onChangeText={(v) => updateService(index, 'title', v)}
                                />
                            </View>

                            <Text style={styles.fieldLabel}>
                                السعر <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="اكتب هنا.."
                                    placeholderTextColor="#B0B0B0"
                                    value={service.price}
                                    onChangeText={(v) => updateService(index, 'price', v)}
                                    keyboardType="numeric"
                                />
                            </View>

                            <Text style={styles.fieldLabel}>
                                مدة التنفيذ (الساعة) <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="اكتب هنا.."
                                    placeholderTextColor="#B0B0B0"
                                    value={service.duration}
                                    onChangeText={(v) => updateService(index, 'duration', v)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (!hasValidService || submitting) && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!hasValidService || submitting}
                    activeOpacity={0.8}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text
                            style={[
                                styles.submitButtonText,
                                !hasValidService && styles.submitButtonTextDisabled,
                            ]}
                        >
                            أضف وابدأ تجربتك
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
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
        marginBottom: 24,
        ...rtlWritingMode,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        marginBottom: 12,
        ...rtlText.alignStart,
        ...rtlWritingMode,
    },
    portfolioScroll: {
        marginBottom: 24,
    },
    portfolioRow: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 4,
    },
    addPortfolioButton: {
        width: 80,
        height: 80,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#D0D0D0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    portfolioImageWrapper: {
        width: 80,
        height: 80,
        borderRadius: 14,
        overflow: 'hidden',
    },
    portfolioImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 2,
        left: 2,
        backgroundColor: '#FFF',
        borderRadius: 11,
    },
    servicesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addServiceText: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#0a7ea4',
        ...rtlText.alignStart,
        ...rtlWritingMode,
    },
    serviceCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    removeServiceButton: {
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    fieldLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        marginBottom: 8,
        ...rtlText.alignStart,
        ...rtlWritingMode,
    },
    required: {
        color: '#E11D48',
    },
    inputContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 14,
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    input: {
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
        ...rtlInput,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
        paddingTop: 12,
    },
    submitButton: {
        backgroundColor: '#000',
        height: 56,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#CCC',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
    },
    submitButtonTextDisabled: {
        color: '#999',
    },
});
