import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    ActionSheetIOS,
    Modal,
    FlatList,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/config/authContext';
import { isStylistUser } from '@/config/navigationFlow';
import apiService, { FashionStyle } from '@/config/apiService';
import api from '@/config/axios';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { stylistScreenDirection } from '@/config/rtlLayout';
import { rtlInput, rtlText } from '@/config/rtlText';
import { StylistScreenHeader, STYLIST_GREEN } from '@/components/StylistScreenHeader';
import SaudiRiyalSymbol from '@/components/SaudiRiyalSymbol';
import {
    appendImageFieldToFormData,
    isLocalImageUri,
    MAX_STYLIST_IMAGE_BYTES,
} from '@/utils/imageUploadFormData';
import { ensureUploadableImageUri } from '@/utils/ensureUploadableImageUri';
import { resolveMediaUrl } from '@/utils/resolveMediaUrl';

const EXPERIENCE_OPTIONS = [
    { label: 'أقل من سنة', value: '0' },
    { label: 'سنة - سنتين', value: '1' },
    { label: '3 - 5 سنوات', value: '3' },
    { label: '5 - 10 سنوات', value: '5' },
    { label: 'أكثر من 10 سنوات', value: '10' },
];

export default function StylistEditProfileScreen() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();

    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [pickingCover, setPickingCover] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tagline, setTagline] = useState('');
    const [bio, setBio] = useState('');
    const [hourlyPrice, setHourlyPrice] = useState('');
    const [experience, setExperience] = useState('');
    const [experienceLabel, setExperienceLabel] = useState('');
    const [selectedStyleId, setSelectedStyleId] = useState<number | null>(null);
    const [selectedStyleName, setSelectedStyleName] = useState('');

    const [fashionStyles, setFashionStyles] = useState<FashionStyle[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showExperiencePicker, setShowExperiencePicker] = useState(false);
    const [showStylePicker, setShowStylePicker] = useState(false);

    const [bankName, setBankName] = useState('');
    const [bankAccountHolder, setBankAccountHolder] = useState('');
    const [iban, setIban] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        } else if (!authLoading && isAuthenticated && !isStylistUser(user)) {
            router.replace('/pages/tabs/homescreen' as any);
        }
    }, [isAuthenticated, authLoading, user]);

    const loadData = useCallback(async () => {
        setLoadingProfile(true);
        try {
            const [profileRes, stylesRes] = await Promise.allSettled([
                apiService.getStylistProfile(),
                apiService.getFashionStyles({ per_page: 50 }),
            ]);

            if (stylesRes.status === 'fulfilled') {
                const payload = stylesRes.value?.data;
                setFashionStyles(Array.isArray(payload) ? payload : []);
            }

            if (profileRes.status === 'fulfilled') {
                const p = profileRes.value?.data;
                setName(user?.name || p?.name || '');
                setEmail(user?.email || p?.email || '');
                setTagline(p?.bio || '');
                setBio(p?.about || '');
                setCoverImage(p?.cover_url || p?.image_url || p?.cover || p?.image || null);

                // Experience
                if (p?.experience_years != null) {
                    const expVal = String(p.experience_years);
                    setExperience(expVal);
                    const found = EXPERIENCE_OPTIONS.find((o) => o.value === expVal);
                    if (found) setExperienceLabel(found.label);
                }

                // Hourly price
                if (p?.price != null) {
                    setHourlyPrice(String(p.price));
                }

                // Fashion style
                if (p?.fashion_styles?.length > 0) {
                    const firstStyle = p.fashion_styles[0];
                    setSelectedStyleId(Number(firstStyle.id || firstStyle));
                    setSelectedStyleName(firstStyle.name || '');
                } else if (p?.fashion_style_ids?.length > 0) {
                    setSelectedStyleId(Number(p.fashion_style_ids[0]));
                }

                setBankName(p?.bank_name || '');
                setBankAccountHolder(p?.bank_account_holder || '');
                setIban(p?.iban || '');
            }
        } catch (error) {
            console.error('Load profile error:', error);
        } finally {
            setLoadingProfile(false);
        }
    }, [user]);

    useEffect(() => {
        if (isAuthenticated) loadData();
    }, [isAuthenticated, loadData]);

    // Resolve style name after styles load
    useEffect(() => {
        if (selectedStyleId && !selectedStyleName && fashionStyles.length > 0) {
            const found = fashionStyles.find((s) => Number(s.id) === selectedStyleId);
            if (found) setSelectedStyleName(found.name);
        }
    }, [selectedStyleId, selectedStyleName, fashionStyles]);

    const pickImage = async (useCamera: boolean) => {
        try {
            setPickingCover(true);
            const permissionResult = useCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى السماح بالوصول للصور' });
                return;
            }

            const result = useCamera
                ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [16, 9], quality: 0.85 })
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.85 });

            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                const sz = asset.fileSize ?? 0;
                if (sz > 0 && sz > MAX_STYLIST_IMAGE_BYTES) {
                    Toast.show({
                        type: 'error',
                        text1: 'خطأ',
                        text2: 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)',
                    });
                    return;
                }
                const readyUri = await ensureUploadableImageUri(asset.uri);
                setCoverImage(readyUri);
            }
        } catch {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'فشل في اختيار الصورة' });
        } finally {
            setPickingCover(false);
        }
    };

    const showImageOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['إلغاء', 'التقاط صورة', 'اختيار من الاستوديو'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) pickImage(true);
                    else if (buttonIndex === 2) pickImage(false);
                }
            );
        } else {
            pickImage(false);
        }
    };

    const handleSave = async () => {
        if (!tagline.trim()) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إدخال النبذة القصيرة' });
            return;
        }

        setSaving(true);
        try {
            if (coverImage && isLocalImageUri(coverImage)) {
                const uploadUri = await ensureUploadableImageUri(coverImage);
                const formData = new FormData();
                if (name.trim()) formData.append('name', name.trim());
                if (tagline.trim()) formData.append('bio', tagline.trim());
                if (bio.trim()) formData.append('about', bio.trim());
                if (selectedStyleId) {
                    formData.append('fashion_style_ids[]', String(selectedStyleId));
                }
                formData.append('bank_name', bankName.trim() || '');
                formData.append('bank_account_holder', bankAccountHolder.trim() || '');
                formData.append('iban', iban.trim().replace(/\s/g, '') || '');
                appendImageFieldToFormData(formData, 'cover', uploadUri);
                await api.post('/user/stylist/profile', formData);
            } else {
                const payload: Record<string, any> = {};
                if (name.trim()) payload.name = name.trim();
                if (tagline.trim()) payload.bio = tagline.trim();
                if (bio.trim()) payload.about = bio.trim();
                if (selectedStyleId) payload.fashion_style_ids = [selectedStyleId];

                payload.bank_name = bankName.trim() || null;
                payload.bank_account_holder = bankAccountHolder.trim() || null;
                payload.iban = iban.trim().replace(/\s/g, '') || null;

                await api.put('/user/stylist/profile', payload);
            }
            await refreshUser();

            Toast.show({ type: 'success', text1: 'تم الحفظ', text2: 'تم تحديث ملفك الشخصي بنجاح' });
            router.back();
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'حدث خطأ أثناء الحفظ';
            Toast.show({ type: 'error', text1: 'خطأ', text2: msg });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loadingProfile) {
        return (
            <SafeAreaView style={[styles.container, stylistScreenDirection]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={STYLIST_GREEN} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, stylistScreenDirection]} edges={['top']}>
            <StylistScreenHeader title="تعديل الملف" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Cover Image */}
                    <Text style={styles.fieldLabel}>صورة الغلاف</Text>
                    <TouchableOpacity
                        style={styles.coverUpload}
                        onPress={showImageOptions}
                        activeOpacity={0.7}
                        disabled={pickingCover}
                    >
                        {coverImage ? (
                            <ExpoImage
                                source={{
                                    uri: isLocalImageUri(coverImage)
                                        ? coverImage
                                        : (resolveMediaUrl(coverImage) ?? coverImage),
                                }}
                                style={styles.coverPreview}
                                contentFit="cover"
                                transition={200}
                                cachePolicy="memory-disk"
                            />
                        ) : (
                            <View style={styles.coverPlaceholder}>
                                {pickingCover ? (
                                    <ActivityIndicator size="large" color={STYLIST_GREEN} />
                                ) : (
                                    <>
                                        <Ionicons name="image-outline" size={32} color="#B0B0B0" />
                                        <Text style={styles.coverUploadText}>اضغط لرفع الصورة</Text>
                                    </>
                                )}
                            </View>
                        )}
                        <View style={styles.coverEditBadge}>
                            <Ionicons name="camera" size={16} color="#FFF" />
                        </View>
                    </TouchableOpacity>

                    {/* Name */}
                    <Text style={styles.fieldLabel}>الاسم</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="اسمك"
                            placeholderTextColor="#B0B0B0"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Email (read-only) */}
                    <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
                    <View style={[styles.inputContainer, styles.disabledInputContainer]}>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            placeholder="البريد الإلكتروني"
                            placeholderTextColor="#B0B0B0"
                            value={email}
                            editable={false}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Tagline */}
                    <Text style={styles.fieldLabel}>
                        النبذة القصيرة (Tagline) <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="نبذة قصيرة عنك"
                            placeholderTextColor="#B0B0B0"
                            value={tagline}
                            onChangeText={setTagline}
                            maxLength={100}
                        />
                    </View>

                    {/* Bio */}
                    <Text style={styles.fieldLabel}>النبذة التفصيلية</Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer]}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="نبذة تفصيلية عنك"
                            placeholderTextColor="#B0B0B0"
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={500}
                        />
                    </View>

                    {/* Hourly Price */}
                    <View style={styles.fieldLabelWithSymbol}>
                        <Text style={[styles.fieldLabel, styles.fieldLabelNoMb]}>سعر الساعة</Text>
                        <SaudiRiyalSymbol size={15} color="#333" />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="مثلاً: 150"
                            placeholderTextColor="#B0B0B0"
                            value={hourlyPrice}
                            onChangeText={setHourlyPrice}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Experience */}
                    <Text style={styles.fieldLabel}>سنين الخبرة</Text>
                    <TouchableOpacity
                        style={styles.dropdownContainer}
                        onPress={() => setShowExperiencePicker(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.dropdownText, !experienceLabel && styles.dropdownPlaceholder]}>
                            {experienceLabel || 'اختر سنين الخبرة'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#999" />
                    </TouchableOpacity>

                    {/* Style Type */}
                    <Text style={styles.fieldLabel}>نوع الاستايل</Text>
                    <TouchableOpacity
                        style={styles.dropdownContainer}
                        onPress={() => setShowStylePicker(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.dropdownText, !selectedStyleName && styles.dropdownPlaceholder]}>
                            {selectedStyleName || 'اختر نوع الاستايل'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#999" />
                    </TouchableOpacity>

                    <Text style={[styles.fieldLabel, { marginTop: 20 }]}>بيانات السحب البنكي</Text>
                    <Text style={styles.bankHint}>مطلوبة لطلبات تحويل الأرباح</Text>
                    <Text style={styles.fieldLabel}>اسم البنك</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="مثال: بنك الراجحي"
                            placeholderTextColor="#B0B0B0"
                            value={bankName}
                            onChangeText={setBankName}
                        />
                    </View>
                    <Text style={styles.fieldLabel}>اسم صاحب الحساب</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="كما في البنك"
                            placeholderTextColor="#B0B0B0"
                            value={bankAccountHolder}
                            onChangeText={setBankAccountHolder}
                        />
                    </View>
                    <Text style={styles.fieldLabel}>الآيبان (IBAN)</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="SA..."
                            placeholderTextColor="#B0B0B0"
                            value={iban}
                            onChangeText={setIban}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={{ height: 30 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Experience Picker Modal */}
            <Modal visible={showExperiencePicker} transparent animationType="slide">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowExperiencePicker(false)}
                >
                    <View style={[styles.modalContent, stylistScreenDirection]}>
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
                                    <Ionicons name="checkmark" size={20} color="#064E3B" />
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
                    <View style={[styles.modalContent, stylistScreenDirection]}>
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
                                        <Ionicons name="checkmark" size={20} color="#064E3B" />
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
        backgroundColor: '#F3F4F6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 30,
    },

    // Cover
    coverUpload: {
        backgroundColor: '#F0F0F0',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        overflow: 'hidden',
        marginBottom: 24,
        height: 140,
    },
    coverPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    coverPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    coverUploadText: {
        fontSize: 13,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    coverEditBadge: {
        position: 'absolute',
        bottom: 10,
        start: 10,
        backgroundColor: '#064E3B',
        borderRadius: 14,
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Fields
    fieldLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        marginBottom: 8,
        ...rtlText.alignStart,
    },
    fieldLabelWithSymbol: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        ...rtlText.alignStart,
    },
    fieldLabelNoMb: {
        marginBottom: 0,
    },
    required: {
        color: '#E11D48',
    },
    bankHint: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        marginBottom: 12,
        ...rtlText.alignStart,
    },
    inputContainer: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        height: 52,
        justifyContent: 'center',
        paddingHorizontal: 18,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    disabledInputContainer: {
        backgroundColor: '#F7F7F7',
    },
    textAreaContainer: {
        height: 110,
        paddingVertical: 14,
        justifyContent: 'flex-start',
    },
    input: {
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
        ...rtlInput,
    },
    disabledInput: {
        color: '#6B7280',
    },
    textArea: {
        flex: 1,
        textAlignVertical: 'top',
        ...rtlInput,
    },
    dropdownContainer: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    dropdownText: {
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
        flex: 1,
        ...rtlText.alignStart,
    },
    dropdownPlaceholder: {
        color: '#B0B0B0',
    },

    // Footer
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
        paddingTop: 12,
    },
    saveButton: {
        backgroundColor: '#064E3B',
        height: 56,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
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
        backgroundColor: '#F0FDF4',
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
    },
    modalOptionTextSelected: {
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
});
