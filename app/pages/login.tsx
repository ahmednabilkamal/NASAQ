import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userScreenDirection } from '@/config/rtlLayout';
import { rtlInput, rtlText } from '@/config/rtlText';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import { useAuth } from '@/config/authContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import { ROUTES, href } from '@/constants/routes';

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={14} color="#E11D48" style={styles.errorIcon} />
            <Text style={styles.errorText}>{message}</Text>
        </View>
    );
}

export default function AuthScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
        loading,
        fieldErrors,
        rememberMe,
        toggleRememberMe,
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
            <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }, userScreenDirection]}>
                <ActivityIndicator size="large" color="#064E3B" />
            </View>
        );
    }

    const content = (pageData as any)[languageCode] || (pageData as any)['ar'];
    const loginContent = content.login;
    const registerContent = content.register;
    const currentContent = isLogin ? loginContent : registerContent;

    const handleHeaderBack = () => {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        if (!isLogin) {
            setAuthMode(true);
            return;
        }
        router.replace(href(ROUTES.index));
    };

    return (
        <SafeAreaView style={[styles.container, userScreenDirection]} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 8 : 0}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleHeaderBack} style={styles.backButton}>
                        <Ionicons name={getBackChevron()} size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: Math.max(insets.bottom, 12) + 32 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
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
                        {/* Name (register only) */}
                        {!isLogin && (
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>
                                    {registerContent.namePlaceholder}
                                    <Text style={styles.required}> *</Text>
                                </Text>
                                <View style={[styles.inputContainer, fieldErrors.name && styles.inputContainerError]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="محمد علي اسامة"
                                        placeholderTextColor="#B0B0B0"
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                                <FieldError message={fieldErrors.name} />
                            </View>
                        )}

                        {/* Email / Identifier */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>
                                {isLogin ? loginContent.identifierPlaceholder : registerContent.emailPlaceholder}
                                <Text style={styles.required}> *</Text>
                            </Text>
                            <View style={[styles.inputContainer, fieldErrors.identifier && styles.inputContainerError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={isLogin ? 'البريد الإلكتروني أو رقم الجوال' : 'name@example.com'}
                                    placeholderTextColor="#B0B0B0"
                                    value={identifier}
                                    onChangeText={setIdentifier}
                                    keyboardType={isLogin ? 'default' : 'email-address'}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            <FieldError message={fieldErrors.identifier} />
                        </View>

                        {/* Mobile (register only) */}
                        {!isLogin && (
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>
                                    {registerContent.mobilePlaceholder}
                                    <Text style={styles.required}> *</Text>
                                </Text>
                                <View style={[styles.inputContainer, fieldErrors.mobile && styles.inputContainerError]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="5XXXXXXXX"
                                        placeholderTextColor="#B0B0B0"
                                        keyboardType="phone-pad"
                                        value={mobile}
                                        onChangeText={setMobile}
                                    />
                                </View>
                                <FieldError message={fieldErrors.mobile} />
                            </View>
                        )}

                        {/* Password */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>
                                {loginContent.passwordPlaceholder}
                                <Text style={styles.required}> *</Text>
                            </Text>
                            <View style={[styles.inputContainer, fieldErrors.password && styles.inputContainerError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#B0B0B0"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                            <FieldError message={fieldErrors.password} />
                        </View>

                        {isLogin ? (
                            <View style={styles.optionsRow}>
                                <TouchableOpacity
                                    style={styles.checkboxContainer}
                                    onPress={toggleRememberMe}
                                    activeOpacity={0.7}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: rememberMe }}
                                >
                                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                        {rememberMe ? (
                                            <Ionicons name="checkmark" size={14} color="#FFF" />
                                        ) : null}
                                    </View>
                                    <Text style={styles.rememberMeText}>{loginContent.rememberMe}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* Confirm Password (register only) */
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>
                                    {registerContent.confirmPasswordPlaceholder}
                                    <Text style={styles.required}> *</Text>
                                </Text>
                                <View style={[styles.inputContainer, fieldErrors.confirmPassword && styles.inputContainerError]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="••••••••"
                                        placeholderTextColor="#B0B0B0"
                                        secureTextEntry
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                </View>
                                <FieldError message={fieldErrors.confirmPassword} />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.nextButton, loading && styles.nextButtonDisabled]}
                            onPress={handleNext}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.nextButtonText}>
                                    {isLogin ? loginContent.nextButton : registerContent.nextButton}
                                </Text>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        direction: 'rtl',
    },
    keyboardView: {
        flex: 1,
        direction: 'rtl',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'flex-start',
    },
    backButton: {
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        marginBottom: 8,
        ...rtlText.alignStart,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        marginBottom: 30,
        lineHeight: 22,
        ...rtlText.alignStart,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        borderRadius: 25,
        padding: 5,
        marginBottom: 30,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 22,
    },
    activeTab: {
        backgroundColor: '#064E3B',
    },
    tabText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
    },
    activeTabText: {
        color: '#FFF',
    },
    form: {
        gap: 18,
    },
    inputWrapper: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#555',
        ...rtlText.alignStart,
    },
    required: {
        color: '#E11D48',
    },
    inputContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 15,
        height: 55,
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    inputContainerError: {
        borderColor: '#E11D48',
        backgroundColor: '#FFF5F5',
    },
    input: {
        fontSize: 16,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
        ...rtlInput,
    },
    errorRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 4,
        marginTop: 2,
    },
    errorIcon: {
        marginTop: 1,
    },
    errorText: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#E11D48',
        ...rtlText.alignStart,
    },
    optionsRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    checkboxContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#DDD',
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#064E3B',
        borderColor: '#064E3B',
    },
    rememberMeText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        ...rtlText.alignStart,
    },
    nextButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
    },
    nextButtonDisabled: {
        opacity: 0.7,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
    },
    footer: {
        alignItems: 'center',
        marginTop: 8,
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'center',
    },
    footerLink: {
        color: '#10B981',
        fontFamily: 'Cairo_700Bold',
    },
});
