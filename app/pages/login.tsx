import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    I18nManager,
    Image,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/config/authContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { showErrorToast } from '@/utils/errorHandler';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { InputSizes, ButtonSizes } from '@/utils/spacing';
import Toast from 'react-native-toast-message';

export default function AuthScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const {
        isLogin,
        setAuthMode,
        toggleAuthMode,
        handleNext,
        identifier,
        setIdentifier,
        password,
        setPassword,
        name,
        setName,
        mobile,
        setMobile,
        confirmPassword,
        setConfirmPassword,
        loading
    } = useAuthForm();

    const { isAuthenticated, loading: authLoading, getOnboardingStep, user, refreshUser } = useAuth();
    const { signInWithGoogle, loading: googleLoading, isReady: googleReady } = useGoogleAuth();

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithGoogle();
            if (result?.data?.user || result?.user) {
                await refreshUser();
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: I18nManager.isRTL ? 'خطأ' : 'Error',
                text2: error.message || (I18nManager.isRTL ? 'فشل تسجيل الدخول بجوجل' : 'Google sign-in failed'),
            });
        }
    };

    const passwordValidation = useMemo(() => {
        const hasLatinUpper = /[A-Z]/.test(password);
        const hasLatinLower = /[a-z]/.test(password);
        const hasArabicLetter = /[\u0600-\u06FF]/.test(password);

        const hasWesternNumber = /[0-9]/.test(password);
        const hasArabicNumber = /[\u0660-\u0669\u06F0-\u06F9]/.test(password);

        return {
            hasMinLength: password.length >= 8,
            hasUppercase: hasLatinUpper || hasArabicLetter,
            hasLowercase: hasLatinLower || hasArabicLetter,
            hasNumber: hasWesternNumber || hasArabicNumber,
        };
    }, [password]);


    React.useEffect(() => {
        if (!authLoading && isAuthenticated) {
            const nextStep = getOnboardingStep(user);
            router.replace(nextStep || '/pages/tabs/homescreen' as any);
        }
    }, [isAuthenticated, authLoading, user]);


    if (authLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
                <ActivityIndicator size="large" color="#064E3B" />
            </View>
        );
    }

    const content = (pageData as any)[languageCode];
    const loginContent = content.login;
    const registerContent = content.register;
    const currentContent = isLogin ? loginContent : registerContent;

    const isRTL = I18nManager.isRTL;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons
                            name={isRTL ? 'arrow-forward' : 'arrow-back'}
                            size={24}
                            color="#000"
                        />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>{currentContent.title}</Text>
                    <Text style={styles.subtitle}>{currentContent.subtitle}</Text>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, isLogin && styles.activeTab]}
                            onPress={() => setAuthMode(true)}
                        >
                            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                                {loginContent.title}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, !isLogin && styles.activeTab]}
                            onPress={() => setAuthMode(false)}
                        >
                            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                                {registerContent.title}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        {!isLogin && (
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>{registerContent.namePlaceholder}<Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="محمد علي اسامة"
                                        placeholderTextColor="#999"
                                        textAlign={isRTL ? 'right' : 'left'}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>
                                {isLogin ? loginContent.identifierPlaceholder : registerContent.emailPlaceholder}
                                <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="example@mail.com"
                                    placeholderTextColor="#999"
                                    textAlign={isRTL ? 'right' : 'left'}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={identifier}
                                    onChangeText={setIdentifier}
                                />
                            </View>
                            {!isLogin && (
                                <Text style={styles.hintText}>
                                    {isRTL ? "يجب استخدام حروف إنجليزية للبريد الإلكتروني" : "Email must use English characters"}
                                </Text>
                            )}
                        </View>

                        {!isLogin && (
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>{registerContent.mobilePlaceholder}<Text style={styles.required}>*</Text></Text>
                                <View style={styles.phoneInputContainer}>
                                    <TouchableOpacity style={styles.countryCodeButton}>
                                        <Text style={styles.flagEmoji}>🇸🇦</Text>
                                        <Text style={styles.countryCode}>+966</Text>
                                        <Ionicons name="chevron-down" size={16} color="#999" />
                                    </TouchableOpacity>
                                    <View style={styles.phoneDivider} />
                                    <TextInput
                                        style={styles.phoneInput}
                                        placeholder="512345678"
                                        placeholderTextColor="#999"
                                        keyboardType="phone-pad"
                                        textAlign={isRTL ? 'right' : 'left'}
                                        value={mobile}
                                        onChangeText={setMobile}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>{loginContent.passwordPlaceholder}<Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={isRTL ? "ادخل كلمة المرور" : "Enter password"}
                                    placeholderTextColor="#999"
                                    secureTextEntry
                                    textAlign={isRTL ? 'right' : 'left'}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                            {!isLogin && password.length > 0 && (
                                <View style={styles.passwordValidation}>
                                    <View style={styles.validationRow}>
                                        <Ionicons
                                            name={passwordValidation.hasMinLength ? "checkmark-circle" : "close-circle"}
                                            size={16}
                                            color={passwordValidation.hasMinLength ? "#10B981" : "#EF4444"}
                                        />
                                        <Text style={[styles.validationText, passwordValidation.hasMinLength && styles.validationTextValid]}>
                                            {isRTL ? "على الأقل ٨ أحرف" : "At least 8 characters"}
                                        </Text>
                                    </View>
                                    <View style={styles.validationRow}>
                                        <Ionicons
                                            name={passwordValidation.hasUppercase ? "checkmark-circle" : "close-circle"}
                                            size={16}
                                            color={passwordValidation.hasUppercase ? "#10B981" : "#EF4444"}
                                        />
                                        <Text style={[styles.validationText, passwordValidation.hasUppercase && styles.validationTextValid]}>
                                            {isRTL ? "حرف كبير" : "Uppercase letter"}
                                        </Text>
                                    </View>
                                    <View style={styles.validationRow}>
                                        <Ionicons
                                            name={passwordValidation.hasLowercase ? "checkmark-circle" : "close-circle"}
                                            size={16}
                                            color={passwordValidation.hasLowercase ? "#10B981" : "#EF4444"}
                                        />
                                        <Text style={[styles.validationText, passwordValidation.hasLowercase && styles.validationTextValid]}>
                                            {isRTL ? "حرف صغير" : "Lowercase letter"}
                                        </Text>
                                    </View>
                                    <View style={styles.validationRow}>
                                        <Ionicons
                                            name={passwordValidation.hasNumber ? "checkmark-circle" : "close-circle"}
                                            size={16}
                                            color={passwordValidation.hasNumber ? "#10B981" : "#EF4444"}
                                        />
                                        <Text style={[styles.validationText, passwordValidation.hasNumber && styles.validationTextValid]}>
                                            {isRTL ? "رقم" : "Number"}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {isLogin ? (
                            <View style={styles.optionsRow}>
                                <TouchableOpacity style={styles.checkboxContainer}>
                                    <View style={styles.checkbox} />
                                    <Text style={styles.rememberMeText}>{loginContent.rememberMe}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>{registerContent.confirmPasswordPlaceholder}<Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={isRTL ? "تأكيد كلمة المرور" : "Confirm password"}
                                        placeholderTextColor="#999"
                                        secureTextEntry
                                        textAlign={isRTL ? 'right' : 'left'}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={handleNext}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.nextButtonText}>{isLogin ? loginContent.nextButton : registerContent.nextButton}</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>{content.common.or}</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity
                            style={[styles.googleButton, (!googleReady || googleLoading) && styles.googleButtonDisabled]}
                            onPress={handleGoogleSignIn}
                            disabled={!googleReady || googleLoading}
                        >
                            {googleLoading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <>
                                    <Image
                                        source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png' }}
                                        style={styles.googleIcon}
                                    />
                                    <Text style={styles.googleButtonText}>{loginContent.googleButton}</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {isLogin ? loginContent.footerText : registerContent.footerText}
                                <Text
                                    style={styles.footerLink}
                                    onPress={toggleAuthMode}
                                >
                                    {isLogin ? loginContent.footerLink : registerContent.footerLink}
                                </Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingVertical: Spacing.verticalSm,
        alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start',
    },
    backButton: {
        padding: Spacing.sm,
    },
    scrollContent: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingBottom: Spacing.verticalXxxxl,
    },
    title: {
        fontSize: FontSizes.h1,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: I18nManager.isRTL ? 'right' : 'left',
        marginBottom: Spacing.verticalXs,
    },
    subtitle: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        textAlign: I18nManager.isRTL ? 'right' : 'left',
        marginBottom: Spacing.verticalXxxl,
        lineHeight: LineHeights.body,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        borderRadius: BorderRadius.xxl,
        padding: Spacing.xs,
        marginBottom: Spacing.verticalXxxl,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.verticalMd,
        alignItems: 'center',
        borderRadius: BorderRadius.xxl,
    },
    activeTab: {
        backgroundColor: '#064E3B',
    },
    tabText: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    activeTabText: {
        color: '#FFF',
    },
    form: {
        gap: Spacing.xl,
    },
    inputWrapper: {
        gap: Spacing.sm,
    },
    label: {
        fontSize: FontSizes.label,
        fontFamily: 'Cairo_700Bold',
        color: '#666',
        textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    required: {
        color: '#E11D48',
    },
    inputContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: BorderRadius.lg,
        height: InputSizes.height,
        justifyContent: 'center',
        paddingHorizontal: InputSizes.paddingHorizontal,
    },
    input: {
        fontSize: FontSizes.input,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
    },
    passwordValidation: {
        marginTop: Spacing.sm,
        gap: Spacing.xs,
    },
    validationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    validationText: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#EF4444',
    },
    validationTextValid: {
        color: '#10B981',
    },
    hintText: {
        fontSize: FontSizes.caption,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        marginTop: Spacing.xs,
        textAlign: I18nManager.isRTL ? 'right' : 'left',
    },
    phoneInputContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: BorderRadius.lg,
        height: InputSizes.height,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: InputSizes.paddingHorizontal,
    },
    countryCodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    flagEmoji: {
        fontSize: FontSizes.bodyLarge,
    },
    countryCode: {
        fontSize: FontSizes.input,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
    },
    phoneDivider: {
        width: 1,
        height: '50%',
        backgroundColor: '#DDD',
        marginHorizontal: Spacing.md,
    },
    phoneInput: {
        flex: 1,
        fontSize: FontSizes.input,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
    },
    optionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: I18nManager.isRTL ? 'flex-end' : 'flex-start',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    checkbox: {
        width: scale(20),
        height: scale(20),
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: '#FFF',
    },
    rememberMeText: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
    },
    nextButton: {
        backgroundColor: '#064E3B',
        height: ButtonSizes.heightMedium,
        borderRadius: BorderRadius.button,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.verticalMd,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: FontSizes.button,
        fontFamily: 'Cairo_700Bold',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xl,
        marginVertical: Spacing.verticalMd,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#EEE',
    },
    dividerText: {
        fontSize: FontSizes.body,
        color: '#999',
        fontFamily: 'Cairo_400Regular',
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        height: ButtonSizes.heightMedium,
        borderRadius: BorderRadius.button,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
    },
    googleButtonDisabled: {
        opacity: 0.6,
    },
    googleIcon: {
        width: IconSizes.sm,
        height: IconSizes.sm,
    },
    googleButtonText: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
    },
    footer: {
        alignItems: 'center',
        marginTop: Spacing.verticalMd,
    },
    footerText: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
    },
    footerLink: {
        color: '#10B981',
        fontFamily: 'Cairo_700Bold',
    },
});
