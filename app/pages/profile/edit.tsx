import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import { useAuth } from '@/config/authContext';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import * as ImagePicker from 'expo-image-picker';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { InputSizes, ButtonSizes } from '@/utils/spacing';
import { showErrorToast, showSuccessToast, showAlert } from '@/utils/errorHandler';

export default function EditProfileScreen() {
    const router = useRouter();
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const isSocialMode = mode === 'social';
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.profile || (pageData as any)['en'].profile;

    const { user, refreshUser, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [image, setImage] = useState<string | null>(user?.image || null);
    const [countryCode, setCountryCode] = useState('+966');
    const [loading, setLoading] = useState(false);
    const [instagram, setInstagram] = useState(user?.instagram || '');
    const [twitter, setTwitter] = useState(user?.twitter || '');
    const [facebook, setFacebook] = useState(user?.facebook || '');

    const pickImage = async (useCamera: boolean) => {
        try {
            const permissionResult = useCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                showErrorToast('permissionDenied', languageCode);
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
            showAlert(
                imageActionContent.title || 'تغيير الصورة',
                imageActionContent.message || 'اختر طريقة التحميل',
                languageCode
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
            const updateData: any = {
                name,
                email,
                phone,
                instagram,
                twitter,
                facebook
            };

            if (image && image !== user?.image) {
                updateData.image = image;
            }

            await updateProfile(updateData);
            showSuccessToast('profileUpdated', languageCode);
            router.back();
        } catch (error: any) {
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name={getBackChevron()} size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{content.editProfile}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {!isSocialMode && (
                        <View style={styles.avatarContainer}>
                            {image ? (
                                <Image
                                    source={{ uri: image }}
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
                    )}

                    <View style={styles.formContainer}>
                        {!isSocialMode && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>الاسم</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={name}
                                        onChangeText={setName}
                                        textAlign="right"
                                        placeholder="أدخل اسمك"
                                        placeholderTextColor="#999"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>البريد الإلكتروني</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        onChangeText={setEmail}
                                        textAlign="right"
                                        placeholder="أدخل بريدك الإلكتروني"
                                        placeholderTextColor="#999"
                                        keyboardType="email-address"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>رقم الجوال</Text>
                                    <View style={styles.phoneInputContainer}>
                                        <TextInput
                                            style={styles.phoneInput}
                                            value={phone}
                                            onChangeText={setPhone}
                                            textAlign="right"
                                            placeholder="أدخل رقم الجوال"
                                            placeholderTextColor="#999"
                                            keyboardType="phone-pad"
                                        />
                                        <View style={styles.countryCodeContainer}>
                                            <Text style={styles.countryCode}>{countryCode}</Text>
                                            <Ionicons name="chevron-down" size={16} color="#666" />
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}

                        <Text style={[styles.label, { marginTop: 10 }]}>وسائل التواصل الإجتماعي</Text>

                        <View style={styles.inputGroup}>
                            <View style={styles.socialInputContainer}>
                                <TextInput
                                    style={styles.socialInput}
                                    value={instagram}
                                    onChangeText={setInstagram}
                                    textAlign="right"
                                    placeholder="رابط إنستجرام"
                                    placeholderTextColor="#999"
                                />
                                <View style={styles.socialIconContainer}>
                                    <Ionicons name="logo-instagram" size={20} color="#E1306C" />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.socialInputContainer}>
                                <TextInput
                                    style={styles.socialInput}
                                    value={twitter}
                                    onChangeText={setTwitter}
                                    textAlign="right"
                                    placeholder="رابط تويتر"
                                    placeholderTextColor="#999"
                                />
                                <View style={styles.socialIconContainer}>
                                    <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.socialInputContainer}>
                                <TextInput
                                    style={styles.socialInput}
                                    value={facebook}
                                    onChangeText={setFacebook}
                                    textAlign="right"
                                    placeholder="رابط فيس بوك"
                                    placeholderTextColor="#999"
                                />
                                <View style={styles.socialIconContainer}>
                                    <Ionicons name="logo-facebook" size={20} color="#4267B2" />
                                </View>
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
    },
    backButton: {
        width: scale(40),
        height: scale(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.xl,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: Spacing.verticalXxxl,
    },
    avatar: {
        width: scale(100),
        height: scale(100),
        borderRadius: BorderRadius.round,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
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
        textAlign: 'right',
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
    phoneInputContainer: {
        flexDirection: 'row',
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
        borderLeftWidth: 1,
        borderLeftColor: '#E5E5E5',
        gap: Spacing.xs,
    },
    countryCode: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
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
    },
    socialInputContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        overflow: 'hidden',
    },
    socialInput: {
        flex: 1,
        paddingHorizontal: InputSizes.paddingHorizontal,
        paddingVertical: InputSizes.paddingVertical,
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    socialIconContainer: {
        width: scale(48),
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#E5E5E5',
        backgroundColor: '#F0F0F0',
    },
});
