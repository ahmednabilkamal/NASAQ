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
    I18nManager,
    ActivityIndicator,
    ActionSheetIOS,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/config/authContext';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

export default function EditProfileScreen() {
    const router = useRouter();
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const isSocialMode = mode === 'social';

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
                Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى منح الصلاحية للوصول إلى الصور' });
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
            console.error('Image picking error:', error);
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'فشل اختيار الصورة' });
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
            Alert.alert(
                'تغيير الصورة',
                'اختر طريقة التحميل',
                [
                    { text: 'إلغاء', style: 'cancel' },
                    { text: 'التقاط صورة', onPress: () => pickImage(true) },
                    { text: 'اختيار من الاستوديو', onPress: () => pickImage(false) },
                ],
                { cancelable: true }
            );
        }
    };

    const handleUpdate = async () => {
        if (!name || !email || !phone) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى ملء جميع الحقول' });
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
            Toast.show({ type: 'success', text1: 'نجاح', text2: 'تم تحديث الملف الشخصي بنجاح' });
            router.back();
        } catch (error: any) {
            // Handle by Toast in interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Avatar */}
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


                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {!isSocialMode && (
                            <>
                                {/* Name */}
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

                                {/* Email */}
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

                                {/* Phone */}
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

                        {/* Social Links Section */}
                        <Text style={[styles.label, { marginTop: 10 }]}>وسائل التواصل الإجتماعي</Text>

                        {/* Instagram */}
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

                        {/* Twitter */}
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

                        {/* Facebook */}
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

                {/* Update Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.updateButton, loading && { opacity: 0.7 }]}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.updateButtonText}>تعديل</Text>}
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
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },

    avatarFallback: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },

    formContainer: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
        textAlign: 'right',
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    phoneInputContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        overflow: 'hidden',
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderLeftWidth: 1,
        borderLeftColor: '#E5E5E5',
        gap: 5,
    },
    countryCode: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    updateButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 27.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
    },
    socialInputContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        overflow: 'hidden',
    },
    socialInput: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    socialIconContainer: {
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#E5E5E5',
        backgroundColor: '#F0F0F0',
    },
});
