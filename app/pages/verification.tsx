import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import { rtlText } from '@/config/rtlText';
import { userScreenDirection } from '@/config/rtlLayout';
import authService from '@/config/authService';

const RESEND_COOLDOWN_SEC = 60;

function formatApiError(error: unknown): string {
    const e = error as {
        response?: { data?: { message?: string; errors?: Record<string, string | string[]> } };
        message?: string;
    };
    const data = e?.response?.data;
    let message =
        (typeof data?.message === 'string' && data.message.trim()) ||
        e?.message ||
        'حدث خطأ';

    const errs = data?.errors;
    if (errs && typeof errs === 'object' && !Array.isArray(errs)) {
        const parts: string[] = [];
        for (const key of Object.keys(errs)) {
            const val = errs[key];
            if (Array.isArray(val)) {
                for (const line of val) {
                    if (typeof line === 'string' && line.trim()) parts.push(line.trim());
                }
            } else if (typeof val === 'string' && val.trim()) {
                parts.push(val.trim());
            }
        }
        if (parts.length > 0) {
            message = parts.join('\n');
        }
    }
    return message;
}

export default function VerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.verification || (pageData as any)['ar'].verification;
    const { login: loginParam } = useLocalSearchParams<{ login?: string }>();

    const [code, setCode] = useState(['', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SEC);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputs = useRef<(TextInput | null)[]>([]);
    const OTP_LEN = 5;

    useEffect(() => {
        const id = setInterval(() => {
            setResendCooldown((s) => Math.max(0, s - 1));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const canResend = resendCooldown <= 0 && !resending;

    const handleCodeChange = (text: string, index: number) => {
        if (errorMessage) {
            setErrorMessage(null);
        }
        const digits = text.replace(/\D/g, '');
        const newCode = [...code];

        if (digits.length === 0) {
            newCode[index] = '';
            setCode(newCode);
            return;
        }

        if (digits.length > 1) {
            for (let i = 0; i < digits.length && index + i < OTP_LEN; i++) {
                newCode[index + i] = digits[i] ?? '';
            }
            setCode(newCode);
            const nextIdx = index + digits.length;
            if (nextIdx < OTP_LEN) {
                inputs.current[nextIdx]?.focus();
            } else {
                inputs.current[OTP_LEN - 1]?.focus();
            }
            return;
        }

        newCode[index] = digits[0] ?? '';
        setCode(newCode);
        if (index < OTP_LEN - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (errorMessage) {
                setErrorMessage(null);
            }
            const newCode = [...code];
            if (code[index] !== '') {
                // If box has a value, clear it and move focus back
                newCode[index] = '';
                setCode(newCode);
                if (index > 0) {
                    inputs.current[index - 1]?.focus();
                }
            } else if (index > 0) {
                // If box is already empty, move to previous box and clear its content
                newCode[index - 1] = '';
                setCode(newCode);
                inputs.current[index - 1]?.focus();
            }
        }
    };

    const handleVerify = async () => {
        const otp = code.join('');
        if (otp.length < 5) {
            setErrorMessage('يرجى إدخال رمز التحقق كاملاً');
            return;
        }
        if (!loginParam) {
            setErrorMessage('لم يتم العثور على بيانات التحقق');
            return;
        }

        setErrorMessage(null);
        setLoading(true);
        try {
            const result = await authService.verifyOtp(
                { login: loginParam, otp },
                { skipErrorToast: true },
            );
            console.log('OTP Verification Response:', result);
            router.replace('/pages/onboarding/roleSelection' as any);
        } catch (error: unknown) {
            setErrorMessage(formatApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!loginParam || !canResend) { return; }
        setErrorMessage(null);
        setResending(true);
        try {
            await authService.sendOtp({ login: loginParam }, { skipErrorToast: true });
            setResendCooldown(RESEND_COOLDOWN_SEC);
            Toast.show({ type: 'success', text1: 'تم', text2: 'تم إرسال رمز التحقق مرة أخرى' });
        } catch (error: unknown) {
            setErrorMessage(formatApiError(error));
        } finally {
            setResending(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, userScreenDirection]} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 8 : 0}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name={getBackChevron()} size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <Text style={styles.title}>{content.title}</Text>
                    <Text style={styles.subtitle}>{content.subtitle}</Text>

                    {loginParam ? (
                        <Text style={styles.loginHint}>{loginParam}</Text>
                    ) : null}

                    <View style={styles.codeContainer}>
                        {code.map((digit, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.digitBox,
                                    errorMessage ? styles.digitBoxError : null,
                                ]}
                            >
                                <TextInput
                                    ref={(ref) => { inputs.current[index] = ref; }}
                                    style={styles.digitInput}
                                    keyboardType="number-pad"
                                    value={digit}
                                    onChangeText={(text) => handleCodeChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    textAlign="center"
                                    selectTextOnFocus
                                    autoFocus={index === 0}
                                />
                            </View>
                        ))}
                    </View>

                    {errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.verifyButtonText}>تحقق</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        {resendCooldown > 0 ? (
                            <Text style={styles.footerText}>
                                يمكنك إعادة الإرسال خلال {resendCooldown} ثانية
                            </Text>
                        ) : null}
                        <TouchableOpacity onPress={handleResendOtp} disabled={!canResend}>
                            <Text style={styles.footerText}>
                                {content.footerText}
                                {resending ? (
                                    <ActivityIndicator size="small" color="#064E3B" />
                                ) : (
                                    <Text style={[styles.footerLink, !canResend && styles.footerLinkDisabled]}>
                                        {content.footerLink}
                                    </Text>
                                )}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        direction: 'rtl',
    },
    keyboardView: {
        flex: 1,
        direction: 'rtl',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 8,
        marginInlineEnd: 'auto',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 20,
    },
    loginHint: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
        marginBottom: 30,
        ...rtlText.alignStart,
        alignSelf: 'stretch',
    },
    codeContainer: {
        // Isolate OTP from global RTL so boxes read left-to-right (0 → 4) like Latin digits.
        direction: 'ltr',
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
        width: '100%',
        justifyContent: 'center',
        alignSelf: 'stretch',
    },
    errorText: {
        width: '100%',
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#B91C1C',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
        paddingHorizontal: 8,
    },
    digitBox: {
        direction: 'ltr',
        width: 56,
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E5E5',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    digitBoxError: {
        borderColor: '#FCA5A5',
        backgroundColor: '#FEF2F2',
    },
    digitInput: {
        fontSize: 24,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        textAlignVertical: 'center',
        writingDirection: 'ltr',
    },
    verifyButton: {
        backgroundColor: '#064E3B',
        height: 55,
        width: '100%',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    verifyButtonDisabled: {
        opacity: 0.7,
    },
    verifyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        ...rtlText.alignStart,
    },
    footer: {
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'center',
    },
    footerLink: {
        color: '#064E3B',
        fontFamily: 'Cairo_700Bold',
    },
    footerLinkDisabled: {
        color: '#9ca3af',
    },
});
