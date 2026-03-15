import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
 ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import authService from '@/config/authService';
import Toast from 'react-native-toast-message';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { InputSizes, ButtonSizes } from '@/utils/spacing';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!currentPassword) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إدخال كلمة المرور الحالية' });
            return;
        }

        if (!newPassword || !confirmPassword) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إدخال كلمة المرور الجديدة' });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'كلمة المرور غير متطابقة' });
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword({
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            Toast.show({ type: 'success', text1: 'نجاح', text2: 'تم تغيير كلمة المرور بنجاح' });
            router.back();
        } catch (error: any) {
             const message = error?.response?.data?.message || 'فشل تغيير كلمة المرور';
             Toast.show({ type: 'error', text1: 'خطأ', text2: message });
        } finally {
            setLoading(false);
        }
    };

    const PasswordInput = ({ label, value, onChange, show, setShow, placeholder }: any) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.passwordContainer}>
                <TouchableOpacity onPress={() => setShow(!show)} style={styles.eyeButton}>
                    <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                </TouchableOpacity>
                <TextInput
                    style={styles.passwordInput}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!show}
                    textAlign="right"
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>تعديل كلمة المرور</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.formContainer}>
                        <PasswordInput
                            label="كلمة المرور الحالية"
                            value={currentPassword}
                            onChange={setCurrentPassword}
                            show={showCurrentPassword}
                            setShow={setShowCurrentPassword}
                            placeholder="أدخل كلمة المرور"
                        />

                        <PasswordInput
                            label="كلمة المرور الجديدة"
                            value={newPassword}
                            onChange={setNewPassword}
                            show={showNewPassword}
                            setShow={setShowNewPassword}
                            placeholder="أدخل كلمة المرور"
                        />

                        <PasswordInput
                            label="تأكيد كلمة المرور"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            show={showConfirmPassword}
                            setShow={setShowConfirmPassword}
                            placeholder="تأكيد كلمة المرور"
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.updateButton, loading && { opacity: 0.7 }]}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.updateButtonText}>تحديث</Text>}
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: InputSizes.paddingHorizontal,
        paddingVertical: InputSizes.paddingVertical,
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    eyeButton: {
        padding: Spacing.lg,
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
});
