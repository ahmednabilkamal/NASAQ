import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/config/authContext';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    I18nManager,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
    Modal,
    Dimensions,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import authService from '@/config/authService';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';

const FALLBACK_AVATARS = [
    'https://i.pinimg.com/736x/0f/01/fd/0f01fd7ee72fa6603a84a023c1a6e7df.jpg',
    'https://static.vecteezy.com/system/resources/thumbnails/021/398/530/small/sad-boy-illustration-free-vector.jpg',
];

export default function ProfileScreen() {
    const router = useRouter();
    const { languageCode, setLanguage } = useLanguage();
    const content = (pageData as any)[languageCode]?.profile || (pageData as any)['en'].profile;
    const commonContent = (pageData as any)[languageCode]?.common || (pageData as any)['en'].common;
    const isRTL = I18nManager.isRTL;
    const { user, logout, refreshUser, isAuthenticated, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const [fallbackIndex, setFallbackIndex] = useState(0);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            console.log('ProfileScreen: Not authenticated, redirecting to login');
            router.replace('/pages/login');
        }
    }, [isAuthenticated, authLoading]);

    const [darkMode, setDarkMode] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '']);
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
            showErrorToast('passwordRequired', languageCode);
            return;
        }
        if (newPassword !== confirmPassword) {
            showErrorToast('passwordMismatch', languageCode);
            return;
        }

        setLoading(true);
        try {
            await authService.sendOtp({ login: user?.phone || user?.email || '' });
            setPasswordModalVisible(false);
            setOtpModalVisible(true);
            setTimer(30);
            setCanResend(false);
            showSuccessToast('verificationSent', languageCode);
        } catch (error: any) {
            showErrorToast('sendFailed', languageCode);
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
            showSuccessToast('passwordChanged', languageCode);
        } catch (error: any) {
            const msg = error?.response?.data?.message;
            showErrorToast('', languageCode, msg);
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
            showSuccessToast('verificationSent', languageCode);
        } catch (error) {
            showErrorToast('sendFailed', languageCode);
        } finally {
            setLoading(false);
        }
    };

    const MenuItem = ({ icon, label, onPress, rightElement }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <Ionicons name={icon} size={22} color="#666" />
                <Text style={styles.menuItemLabel}>{label}</Text>
            </View>
            {rightElement ? rightElement : (
                <Ionicons
                    name={isRTL ? "chevron-back" : "chevron-forward"}
                    size={20}
                    color="#CCC"
                />
            )}
        </TouchableOpacity>
    );

    const LanguageOption = ({ label, selected, onPress }: any) => (
        <TouchableOpacity style={styles.languageOption} onPress={onPress}>
            <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text style={styles.languageLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{content.title}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {user?.image && !avatarError ? (
                            <Image
                                source={{ uri: user.image }}
                                style={styles.avatar}
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <Image
                                source={{ uri: FALLBACK_AVATARS[fallbackIndex] }}
                                style={styles.avatar}
                                onError={() => {
                                    if (fallbackIndex < FALLBACK_AVATARS.length - 1) {
                                        setFallbackIndex(fallbackIndex + 1);
                                    }
                                }}
                            />
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{user?.name || commonContent.defaultName}</Text>
                        <Text style={styles.email}>{user?.email || ""}</Text>

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


                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person-outline" size={18} color="#666" />
                        <Text style={styles.sectionTitle}>{content.personalInfo}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem
                            label={content.editProfile}
                            icon="create-outline"
                            onPress={() => router.push('/pages/profile/edit' as any)}
                        />
                        <MenuItem
                            label={content.changePassword}
                            icon="lock-closed-outline"
                            onPress={() => setPasswordModalVisible(true)}
                        />
                        <MenuItem
                            label={content.payments}
                            icon="card-outline"
                            onPress={() => router.push('/pages/payment/cards' as any)}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="settings-outline" size={18} color="#666" />
                        <Text style={styles.sectionTitle}>{content.settings}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem
                            label={content.darkMode}
                            icon="moon-outline"
                            rightElement={
                                <Switch
                                    value={darkMode}
                                    onValueChange={setDarkMode}
                                    trackColor={{ false: "#EEE", true: "#064E3B" }}
                                    thumbColor="#FFF"
                                />
                            }
                        />
                        <MenuItem
                            label={content.notifications}
                            icon="notifications-outline"
                            onPress={() => router.push('/pages/notifications' as any)}
                        />
                        <MenuItem
                            label={content.language}
                            icon="globe-outline"
                            onPress={() => setLanguageModalVisible(true)}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="headset-outline" size={18} color="#666" />
                        <Text style={styles.sectionTitle}>{content.support}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                        <MenuItem
                            label={content.help}
                            icon="help-circle-outline"
                            onPress={() => { }}
                        />
                        <MenuItem
                            label={content.contactUs}
                            icon="chatbubbles-outline"
                            onPress={() => router.push('/pages/contact_us' as any)}
                        />
                        <MenuItem
                            label={content.privacy}
                            icon="shield-checkmark-outline"
                            onPress={() => { }}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={async () => {
                        await logout();
                        router.replace('/pages/login');
                    }}
                >
                    <Ionicons name="log-out-outline" size={22} color="#E11D48" />
                    <Text style={styles.logoutText}>{content.logout}</Text>
                </TouchableOpacity>
            </ScrollView>
            <BottomNav />

            <Modal
                visible={languageModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setLanguageModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{content.language}</Text>
                        </View>
                        
                        <View style={styles.modalBody}>
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => {
                                    setLanguage('ar');
                                    setLanguageModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalOptionLabel}>{content.languageArabic}</Text>
                                <View style={[styles.modalCheckbox, languageCode === 'ar' && styles.modalCheckboxSelected]}>
                                    {languageCode === 'ar' && <Ionicons name="checkmark" size={16} color="#FFF" />}
                                </View>
                            </TouchableOpacity>

                            <View style={styles.modalDivider} />

                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={() => {
                                    setLanguage('en');
                                    setLanguageModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalOptionLabel}>{content.languageEnglish}</Text>
                                <View style={[styles.modalCheckbox, languageCode === 'en' && styles.modalCheckboxSelected]}>
                                    {languageCode === 'en' && <Ionicons name="checkmark" size={16} color="#FFF" />}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

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
                                <Text style={styles.modalTitle}>{content.changePassword}</Text>
                            </View>

                            <View style={styles.modalBody}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>{content.newPassword}</Text>
                                    <View style={styles.passwordContainer}>
                                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeButton}>
                                            <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                                        </TouchableOpacity>
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showNewPassword}
                                            textAlign={isRTL ? "right" : "left"}
                                            placeholder={content.enterPassword}
                                            placeholderTextColor="#CCC"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>{content.confirmPassword}</Text>
                                    <View style={styles.passwordContainer}>
                                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                                            <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                                        </TouchableOpacity>
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirmPassword}
                                            textAlign={isRTL ? "right" : "left"}
                                            placeholder={content.confirmPassword}
                                            placeholderTextColor="#CCC"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.modalButton, loading && { opacity: 0.7 }]}
                                    onPress={handlePasswordSubmit}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalButtonText}>{content.updateButton}</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </Modal>

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
                                <Text style={styles.modalTitle}>{content.changePassword}</Text>
                            </View>

                            <View style={styles.modalBody}>
                                <Text style={styles.otpSubtitle}>{content.otpInstruction}</Text>

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
                                    <Text style={styles.resendText}>{content.didntReceiveCode} </Text>
                                    <TouchableOpacity onPress={handleResendOtp} disabled={!canResend}>
                                        <Text style={[styles.resendLink, !canResend && { color: '#999' }]}>
                                            {canResend ? content.resendCode : `${content.resendAfter} 00:${timer < 10 ? `0${timer}` : timer} ${commonContent.seconds}`}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[styles.modalButton, loading && { opacity: 0.7 }]}
                                    onPress={() => handleOtpVerify()}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalButtonText}>{content.verify}</Text>}
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
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingVertical: scaleVertical(15),
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.h1,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    scrollContent: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingBottom: scaleVertical(100),
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.verticalXl,
        marginBottom: Spacing.verticalXl,
    },
    avatarContainer: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: 0.1,
        shadowRadius: scale(4),
    },
    avatar: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        borderRadius: scale(40),
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },

    profileInfo: {
        marginLeft: Spacing.lg,
        alignItems: 'flex-start',
    },
    name: {
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    email: {
        fontSize: FontSizes.label,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    section: {
        marginBottom: Spacing.verticalXl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.verticalSm,
        paddingHorizontal: Spacing.xs,
    },
    sectionTitle: {
        fontSize: FontSizes.label,
        fontFamily: 'Cairo_600SemiBold',
        color: '#666',
    },
    sectionContent: {
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: scaleVertical(14),
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    menuItemLabel: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    languageContainer: {
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.verticalSm,
        gap: Spacing.md,
    },
    checkbox: {
        width: scale(22),
        height: scale(22),
        borderRadius: BorderRadius.xs,
        borderWidth: 2,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#064E3B',
        borderColor: '#064E3B',
    },
    languageLabel: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.xl,
        paddingVertical: scaleVertical(15),
        marginTop: Spacing.verticalSm,
        marginBottom: scaleVertical(30),
        borderWidth: 1,
        borderColor: '#FFE4E6',
    },
    logoutText: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
        color: '#E11D48',
    },
    socialRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.verticalXs,
    },
    socialIconMini: {
        width: scale(24),
        height: scale(24),
        borderRadius: BorderRadius.round,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: scale(30),
        borderTopRightRadius: scale(30),
        paddingBottom: scaleVertical(40),
        minHeight: scaleVertical(250),
    },
    modalHeader: {
        paddingVertical: Spacing.verticalXl,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    modalBody: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.verticalXl,
    },
    modalOptionLabel: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
    },
    modalCheckbox: {
        width: scale(24),
        height: scale(24),
        borderRadius: BorderRadius.xs,
        borderWidth: 2,
        borderColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCheckboxSelected: {
        backgroundColor: '#064E3B',
    },
    modalDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    inputGroup: {
        marginTop: Spacing.verticalLg,
        gap: Spacing.verticalSm,
    },
    label: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
        textAlign: I18nManager.isRTL ? 'right' : 'left',
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
        paddingHorizontal: Spacing.lg,
        paddingVertical: scaleVertical(14),
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    eyeButton: {
        padding: Spacing.lg,
    },
    modalButton: {
        backgroundColor: '#064E3B',
        height: scaleVertical(55),
        borderRadius: scale(27.5),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.verticalXxl,
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
    },
    otpSubtitle: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        textAlign: 'center',
        marginTop: Spacing.verticalXl,
        marginBottom: Spacing.verticalXl,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
    },
    otpInput: {
        width: scale(50),
        height: scaleVertical(60),
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        backgroundColor: '#FFF',
        fontSize: FontSizes.h2,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.verticalXl,
        marginBottom: Spacing.verticalSm,
    },
    resendText: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    resendLink: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
});
