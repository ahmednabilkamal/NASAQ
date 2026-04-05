import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    ActionSheetIOS,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { onboardingScreenDirection } from '@/config/rtlLayout';
import { rtlInput, rtlText, rtlWritingMode } from '@/config/rtlText';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { MAX_STYLIST_IMAGE_BYTES } from '@/utils/imageUploadFormData';
import { getStylistOnboardingCoverUri, setStylistOnboardingCoverUri } from '@/utils/stylistOnboardingCoverStorage';
import { ensureUploadableImageUri } from '@/utils/ensureUploadableImageUri';

export default function StylistProfileScreen() {
    const router = useRouter();
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [pickingImage, setPickingImage] = useState(false);
    const [tagline, setTagline] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const stored = await getStylistOnboardingCoverUri();
            if (!cancelled && stored?.trim()) {
                setCoverImage(stored.trim());
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const pickImage = async (useCamera: boolean) => {
        try {
            setPickingImage(true);
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
                    aspect: [16, 9],
                    quality: 0.85,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [16, 9],
                    quality: 0.85,
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
                setCoverImage(readyUri);
                await setStylistOnboardingCoverUri(readyUri);
            }
        } catch {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'فشل في اختيار الصورة' });
        } finally {
            setPickingImage(false);
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

    const handleNext = async () => {
        if (!tagline.trim()) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إدخال نبذة قصيرة تحت الاسم' });
            return;
        }
        if (!bio.trim()) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إدخال نبذة تفصيلية' });
            return;
        }

        await setStylistOnboardingCoverUri(coverImage);
        router.push({
            pathname: '/pages/onboarding/stylistDetails' as any,
            params: {
                tagline: tagline.trim(),
                bio: bio.trim(),
            },
        } as any);
    };

    const canProceed = tagline.trim().length > 0 && bio.trim().length > 0;

    return (
        <SafeAreaView style={[styles.container, onboardingScreenDirection]}>
            <OnboardingHeader
                currentStep={1}
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
                    {/* Title */}
                    <Text style={styles.title}>خلّينا نعرّفك للعميلات</Text>
                    <Text style={styles.subtitle}>
                        ارفع صورة الغلاف واكتب نبذة بسيطة عنك عشان{'\n'}بروفايلك يبقى واضح.
                    </Text>

                    {/* Cover Image Upload */}
                    <Text style={styles.coverLabel}>صورة الغلاف (اختياري)</Text>
                    <TouchableOpacity
                        style={styles.coverUpload}
                        onPress={showImageOptions}
                        activeOpacity={0.7}
                        disabled={pickingImage}
                    >
                        {coverImage ? (
                            <ExpoImage
                                source={{ uri: coverImage }}
                                style={styles.coverPreview}
                                contentFit="cover"
                                transition={200}
                                cachePolicy="memory-disk"
                            />
                        ) : (
                            <View style={styles.coverPlaceholder}>
                                {pickingImage ? (
                                    <ActivityIndicator size="large" color="#0a7ea4" />
                                ) : (
                                    <>
                                        <Ionicons name="image-outline" size={36} color="#B0B0B0" />
                                        <Text style={styles.coverUploadText}>اضغط لرفع الصورة</Text>
                                        <Text style={styles.coverUploadHint}>JPG / PNG / WebP</Text>
                                        <Text style={styles.coverUploadHint}>حتى 5 ميجابايت</Text>
                                    </>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Tagline */}
                    <Text style={styles.fieldLabel}>
                        نبذة قصيرة تحت الاسم (Tagline) <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="اكتب هنا.."
                            placeholderTextColor="#B0B0B0"
                            value={tagline}
                            onChangeText={setTagline}
                            maxLength={100}
                        />
                    </View>

                    {/* Bio */}
                    <Text style={styles.fieldLabel}>
                        نبذة تفصيلية <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer]}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="اكتب هنا.."
                            placeholderTextColor="#B0B0B0"
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={500}
                        />
                    </View>
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
    coverLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        marginBottom: 12,
        ...rtlText.alignStart,
        ...rtlWritingMode,
    },
    coverUpload: {
        backgroundColor: '#F0F0F0',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        overflow: 'hidden',
        marginBottom: 28,
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
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#0a7ea4',
        marginTop: 4,
    },
    coverUploadHint: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#B0B0B0',
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
    textAreaContainer: {
        height: 100,
        paddingVertical: 14,
        justifyContent: 'flex-start',
    },
    input: {
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
        ...rtlInput,
    },
    textArea: {
        flex: 1,
        textAlignVertical: 'top',
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
});
