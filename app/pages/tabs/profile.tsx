import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/config/authContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import authService from '@/config/authService';
import { getForwardChevron } from '@/config/directionalIcons';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            console.log('ProfileScreen: Not authenticated, redirecting to login');
            router.replace('/pages/login');
        }
    }, [isAuthenticated, authLoading, router]);

    // Password Change State
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '']); // 5 digits
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    const otpInputs = React.useRef<TextInput[]>([]);



    useEffect(() => {
        let interval: any;
        if (otpModalVisible && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [otpModalVisible, timer]);

    const handlePasswordSubmit = async () => {
        if (!newPassword || !confirmPassword) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إدخال كلمة المرور' });
            return;
        }
        if (newPassword !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'كلمة المرور غير متطابقة' });
            return;
        }

        setLoading(true);
        try {
            await authService.sendOtp({ login: user?.phone || user?.email || '' });
            setPasswordModalVisible(false);
            setOtpModalVisible(true);
            setTimer(30);
            setCanResend(false);
            Toast.show({ type: 'success', text1: 'تم الإرسال', text2: 'تم إرسال رمز التحقق لهاتفك' });
        } catch {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'فشل إرسال الرمز' });
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async (fullOtp?: string) => {
        const otpValue = fullOtp || otp.join('');
        if (otpValue.length < 5) return;

        setLoading(true);
        try {
            await authService.changePassword({
                otp: otpValue,
                password: newPassword,
                password_confirmation: confirmPassword
            });
            setOtpModalVisible(false);
            setNewPassword('');
            setConfirmPassword('');
            setOtp(['', '', '', '', '']);
            Toast.show({ type: 'success', text1: 'نجاح', text2: 'تم تغيير كلمة المرور بنجاح' });
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'رمز التحقق غير صحيح';
            Toast.show({ type: 'error', text1: 'خطأ', text2: msg });
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 4) {
            otpInputs.current[index + 1].focus();
        }

        if (newOtp.join('').length === 5) {
            handleOtpVerify(newOtp.join(''));
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        setLoading(true);
        try {
            await authService.sendOtp({ login: user?.phone || user?.email || '' });
            setTimer(30);
            setCanResend(false);
            Toast.show({ type: 'success', text1: 'تم الإرسال', text2: 'تم إعادة إرسال الرمز' });
        } catch {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'فشل إرسال الرمز' });
        } finally {
            setLoading(false);
        }
    };

    const MenuItem = ({ icon, label, onPress, rightElement }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon} size={22} color="#666" />
            <Text style={styles.menuItemLabel}>{label}</Text>
            {rightElement ? (
                rightElement
            ) : (
                <Ionicons name={getForwardChevron()} size={20} color="#CCC" />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>الملف الشخصي</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {user?.image ? (
                            <Image
                                source={{ uri: user.image }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Ionicons name="person" size={30} color="#666" />
                            </View>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{user?.name || "نور حسن"}</Text>
                        <Text style={styles.email}>{user?.email || "nourhasan12@gmail.com"}</Text>

                        {(user?.instagram || user?.twitter || user?.facebook) && (
                            <View style={styles.socialRow}>
                                {user?.instagram && (
                                    <View style={styles.socialIconMini}>
                                        <Ionicons name="logo-instagram" size={14} color="#E1306C" />
                                    </View>
                                )}
                                {user?.twitter && (
                                    <View style={styles.socialIconMini}>
                                        <Ionicons name="logo-twitter" size={14} color="#1DA1F2" />
                                    </View>
                                )}
                                {user?.facebook && (
                                    <View style={styles.socialIconMini}>
                                        <Ionicons name="logo-facebook" size={14} color="#4267B2" />
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>


                {/* Personal Info Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person-outline" size={18} color="#666" />
                        <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem
                            label="تعديل الملف الشخصي"
                            icon="create-outline"
                            onPress={() => router.push('/pages/profile/edit' as any)}
                        />
                        <MenuItem
                            label="تغيير كلمة المرور"
                            icon="lock-closed-outline"
                            onPress={() => setPasswordModalVisible(true)}
                        />
                        <MenuItem
                            label="المدفوعات"
                            icon="card-outline"
                            onPress={() => router.push('/pages/payment/cards' as any)}
                        />
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="settings-outline" size={18} color="#666" />
                        <Text style={styles.sectionTitle}>الإعدادات</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem
                            label="الإشعارات"
                            icon="notifications-outline"
                            onPress={() => router.push('/pages/notifications' as any)}
                        />
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="headset-outline" size={18} color="#666" />
                        <Text style={styles.sectionTitle}>الدعم</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem
                            label="المساعدة / الأسئلة الشائعة"
                            icon="help-circle-outline"
                            onPress={() => { }}
                        />
                        <MenuItem
                            label="تواصل معنا"
                            icon="chatbubbles-outline"
                            onPress={() => router.push('/pages/contact_us' as any)}
                        />
                        <MenuItem
                            label="الخصوصية والأمان"
                            icon="shield-checkmark-outline"
                            onPress={() => { }}
                        />
                    </View>
                </View>



                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={async () => {
                        await logout();
                        router.replace('/pages/login');
                    }}
                >
                    <Ionicons name="log-out-outline" size={22} color="#E11D48" />
                    <Text style={styles.logoutText}>تسجيل الخروج</Text>
                </TouchableOpacity>
            </ScrollView>
            <BottomNav />

            {/* Change Password Modal */}
            <Modal
                visible={passwordModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setPasswordModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ width: '100%' }}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>تعديل كلمة المرور</Text>
                            </View>
                            
                            <View style={styles.modalBody}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>كلمة المرور الجديدة</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showNewPassword}
                                            textAlign="right"
                                            placeholder="أدخل كلمة المرور"
                                            placeholderTextColor="#CCC"
                                        />
                                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeButton}>
                                            <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>تأكيد كلمة المرور</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirmPassword}
                                            textAlign="right"
                                            placeholder="تأكيد كلمة المرور"
                                            placeholderTextColor="#CCC"
                                        />
                                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                                            <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    style={[styles.modalButton, loading && { opacity: 0.7 }]}
                                    onPress={handlePasswordSubmit}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalButtonText}>تحديث</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </Modal>

            {/* OTP Modal */}
            <Modal
                visible={otpModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setOtpModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setOtpModalVisible(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ width: '100%' }}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>تأكيد كلمة المرور</Text>
                            </View>
                            
                            <View style={styles.modalBody}>
                                <Text style={styles.otpSubtitle}>أدخل رمز التحقق المرسل إلى رقم هاتفك</Text>
                                
                                <View style={styles.otpContainer}>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(el) => { if (el) otpInputs.current[index] = el; }}
                                            style={styles.otpInput}
                                            value={digit}
                                            onChangeText={(v) => handleOtpChange(v, index)}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            textAlign="center"
                                            onKeyPress={({ nativeEvent }) => {
                                                if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                                                    otpInputs.current[index - 1].focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </View>

                                <View style={styles.resendContainer}>
                                    <Text style={styles.resendText}>لم يصلك الرمز؟ </Text>
                                    <TouchableOpacity onPress={handleResendOtp} disabled={!canResend}>
                                        <Text style={[styles.resendLink, !canResend && { color: '#999' }]}>
                                            {canResend ? 'يمكنك إعادة الإرسال' : `يمكنك إعادة الإرسال بعد 00:${timer < 10 ? `0${timer}` : timer} ثانية`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <TouchableOpacity 
                                    style={[styles.modalButton, loading && { opacity: 0.7 }]}
                                    onPress={() => handleOtpVerify()}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalButtonText}>تأكيد</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
    },
    headerTitle: {
        width: '100%',
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 20,
        gap: 15,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },

    profileInfo: {
        flex: 1,
        alignItems: 'flex-start',
        minWidth: 0,
    },
    name: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        alignSelf: 'stretch',
    },
    email: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        alignSelf: 'stretch',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 8,
        marginBottom: 10,
        paddingHorizontal: 5,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#666',
    },
    sectionContent: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
        gap: 12,
    },
    menuItemLabel: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingVertical: 15,
        marginTop: 10,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#FFE4E6',
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#E11D48',
    },
    socialRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 5,
        justifyContent: 'flex-start',
    },
    socialIconMini: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: 40,
        minHeight: 250,
    },
    modalHeader: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    modalBody: {
        paddingHorizontal: 20,
    },
    // Password Modal specific
    inputGroup: {
        marginTop: 15,
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
        textAlign: 'right',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    passwordContainerRtl: {
        flexDirection: 'row',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    eyeButton: {
        padding: 15,
    },
    modalButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 27.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 25,
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
    },
    // OTP specific
    otpSubtitle: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    otpInput: {
        width: 50,
        height: 60,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#FFF',
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    resendText: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    resendLink: {
        fontSize: 12,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
});
