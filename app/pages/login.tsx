import React from 'react';
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
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/config/authContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import { showErrorToast } from '@/utils/errorHandler';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { InputSizes, ButtonSizes } from '@/utils/spacing';

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

    const { isAuthenticated, loading: authLoading, getOnboardingStep, user } = useAuth();


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
                        <IconSymbol
                            name={isRTL ? 'arrow.left' : 'arrow.right'}
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
                                    placeholder={isLogin ? "محمد علي اسامة" : "example@mail.com"}
                                    placeholderTextColor="#999"
                                    textAlign={isRTL ? 'right' : 'left'}
                                    value={identifier}
                                    onChangeText={setIdentifier}
                                />
                            </View>
                        </View>

                        {!isLogin && (
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>{registerContent.mobilePlaceholder}<Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="01222569996"
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
                                    placeholder="01222569996"
                                    placeholderTextColor="#999"
                                    secureTextEntry
                                    textAlign={isRTL ? 'right' : 'left'}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
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
                                        placeholder="01222569996"
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

                        <TouchableOpacity style={styles.googleButton}>
                            <Image
                                source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png' }}
                                style={styles.googleIcon}
                            />
                            <Text style={styles.googleButtonText}>{loginContent.googleButton}</Text>
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
        alignItems: I18nManager.isRTL ? 'flex-start' : 'flex-end',
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
    optionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: I18nManager.isRTL ? 'flex-start' : 'flex-end',
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
