import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ActionSheetIOS,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import { rtlInput, rtlText } from '@/config/rtlText';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import { useAuth } from '@/config/authContext';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { resolveMediaUrl } from '@/utils/resolveMediaUrl';
import * as ImagePicker from 'expo-image-picker';
import { scale } from '@/utils/responsive';
import { Spacing, BorderRadius, InputSizes, ButtonSizes } from '@/utils/spacing';
import { FontSizes } from '@/utils/typography';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';

export default function EditProfileScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.profile || (pageData as any)['en'].profile;

    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [image, setImage] = useState<string | null>(user?.image || null);
    const countryCode = '+966';
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            // Keep API value so `image !== user.image` still detects new picks only (not origin-rewritten URLs).
            const raw = user.image;
            setImage(raw != null && raw !== '' ? String(raw) : null);
        }, [user])
    );

    const showPermissionSettingsAlert = () => {
        const c = (pageData as any)[languageCode] || (pageData as any)['ar'];
        const err = c.errors || {};
        Alert.alert(err.permissionDenied || 'تم رفض الإذن', err.permissionSettingsHint || '', [
            {
                text: (pageData as any)[languageCode]?.imageAction?.cancel || 'إلغاء',
                style: 'cancel',
            },
            { text: err.openSettings || 'فتح الإعدادات', onPress: () => void Linking.openSettings() },
        ]);
    };

    const mediaLibraryAccessOk = (r: ImagePicker.MediaLibraryPermissionResponse) =>
        r.granted || r.accessPrivileges === 'limited' || r.accessPrivileges === 'all';

    const pickImage = async (useCamera: boolean) => {
        try {
            if (useCamera) {
                const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
                if (!permissionResult.granted) {
                    showPermissionSettingsAlert();
                    return;
                }
            } else {
                const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!mediaLibraryAccessOk(permissionResult)) {
                    showPermissionSettingsAlert();
                    return;
                }
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

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            showErrorToast('imageSelectFailed', languageCode);
        }
    };

    const showImageOptions = () => {
        const imageActionContent = (pageData as any)[languageCode]?.imageAction || (pageData as any)['en'].imageAction;
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [imageActionContent.cancel || 'إلغاء', imageActionContent.takePhoto || 'التقاط صورة', imageActionContent.chooseFromGallery || 'اختيار من الاستوديو'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) pickImage(true);
                    else if (buttonIndex === 2) pickImage(false);
                }
            );
        } else {
            Alert.alert(
                imageActionContent.title || 'تغيير الصورة',
                imageActionContent.message || 'اختر طريقة التحميل',
                [
                    {
                        text: imageActionContent.takePhoto || 'التقاط صورة',
                        onPress: () => void pickImage(true),
                    },
                    {
                        text: imageActionContent.chooseFromGallery || 'اختيار من المعرض',
                        onPress: () => void pickImage(false),
                    },
                    {
                        text: imageActionContent.cancel || 'إلغاء',
                        style: 'cancel',
                    },
                ]
            );
        }
    };

    const handleUpdate = async () => {
        if (!name || !email || !phone) {
            showErrorToast('allFieldsRequired', languageCode);
            return;
        }

        setLoading(true);
        try {
            const updateData: Record<string, unknown> = {
                name,
                email,
                phone,
            };

            if (image && image !== user?.image) {
                updateData.image = image;
            }

            await updateProfile(updateData as any);
            showSuccessToast('profileUpdated', languageCode);
            router.back();
        } catch (error: any) {
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, userScreenDirection]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name={getBackChevron()} size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{content.editProfile}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.avatarBlock}>
                        <View style={styles.avatarCircleWrap}>
                            {image ? (
                                <Image
                                    source={{ uri: resolveMediaUrl(image) ?? image }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <Ionicons name="person" size={50} color="#666" />
                                </View>
                            )}
                            <TouchableOpacity style={styles.editAvatarButton} onPress={showImageOptions}>
                                <Ionicons name="camera" size={16} color="#064E3B" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>الاسم</Text>
                            <TextInput
                                style={[styles.input, rtlInput]}
                                value={name}
                                onChangeText={setName}
                                placeholder="أدخل اسمك"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>البريد الإلكتروني</Text>
                            <TextInput
                                style={[styles.input, styles.inputDisabled, rtlInput]}
                                value={email}
                                placeholder="أدخل بريدك الإلكتروني"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={false}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>رقم الجوال</Text>
                            <View style={styles.phoneInputContainer}>
                                <View style={styles.countryCodeContainer}>
                                    <Text style={styles.countryCode}>{countryCode}</Text>
                                    <Ionicons name="chevron-down" size={16} color="#666" />
                                </View>
                                <TextInput
                                    style={[styles.phoneInput, rtlInput]}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="أدخل رقم الجوال"
                                    placeholderTextColor="#999"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.updateButton, loading && { opacity: 0.7 }]}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.updateButtonText}>{content.editProfile}</Text>}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.verticalSm,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        gap: 8,
    },
    backButton: {
        width: scale(40),
        height: scale(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSpacer: {
        width: scale(40),
        height: scale(40),
    },
    headerTitle: {
        flex: 1,
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        ...rtlText.alignCenter,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingBottom: Spacing.verticalXxxl,
    },
    avatarBlock: {
        alignItems: 'center',
        marginBottom: Spacing.verticalXxxl,
    },
    avatarCircleWrap: {
        position: 'relative',
        width: scale(100),
        height: scale(100),
    },
    avatar: {
        width: scale(100),
        height: scale(100),
        borderRadius: BorderRadius.round,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        end: 0,
        width: scale(32),
        height: scale(32),
        borderRadius: BorderRadius.round,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },

    avatarFallback: {
        width: scale(100),
        height: scale(100),
        borderRadius: BorderRadius.round,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },

    formContainer: {
        gap: Spacing.xl,
    },
    inputGroup: {
        gap: Spacing.sm,
    },
    label: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
        ...rtlText.alignStart,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: BorderRadius.md,
        paddingHorizontal: InputSizes.paddingHorizontal,
        paddingVertical: InputSizes.paddingVertical,
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    inputDisabled: {
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: '#F8F9FA',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        overflow: 'hidden',
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: InputSizes.paddingHorizontal,
        paddingVertical: InputSizes.paddingVertical,
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: InputSizes.paddingHorizontal,
        borderEndWidth: 1,
        borderEndColor: '#E5E5E5',
        gap: Spacing.xs,
    },
    countryCode: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
        writingDirection: 'ltr',
    },
    footer: {
        padding: Spacing.xl,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    updateButton: {
        backgroundColor: '#064E3B',
        height: ButtonSizes.heightMedium,
        borderRadius: BorderRadius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#FFF',
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
    },
});
