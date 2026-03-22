import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    I18nManager,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { Ionicons } from '@expo/vector-icons';
import authService from '@/config/authService';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { InputSizes, ButtonSizes } from '@/utils/spacing';

export default function VerificationScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.verification || (pageData as any)['en'].verification;
    const { login: loginParam } = useLocalSearchParams<{ login?: string }>();

    const isRTL = I18nManager.isRTL;
    const [code, setCode] = useState(['', '', '', '', '']);
    const [loading, setLoading] = useState(false);

    const convertArabicToWesternNumerals = (text: string): string => {
        const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

        let result = text;
        arabicNumerals.forEach((num, index) => {
            result = result.replace(new RegExp(num, 'g'), index.toString());
        });
        persianNumerals.forEach((num, index) => {
            result = result.replace(new RegExp(num, 'g'), index.toString());
        });
        return result.replace(/[^0-9]/g, '');
    };
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const inputs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0 && !canResend) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [countdown, canResend]);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const handleCodeChange = (text: string, index: number) => {
        const convertedText = convertArabicToWesternNumerals(text);
        const char = convertedText.slice(-1);

        const newCode = [...code];
        newCode[index] = char;
        setCode(newCode);

        if (char && index < 4) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            const newCode = [...code];
            if (code[index] !== '') {
                newCode[index] = '';
                setCode(newCode);
                if (index > 0) {
                    inputs.current[index - 1]?.focus();
                }
            } else if (index > 0) {
                newCode[index - 1] = '';
                setCode(newCode);
                inputs.current[index - 1]?.focus();
            }
        }
    };

    const handleVerify = async () => {
        const otp = code.join('');
        if (otp.length < 5) {
            showErrorToast('verificationIncomplete', languageCode);
            return;
        }
        if (!loginParam) {
            showErrorToast('verificationDataMissing', languageCode);
            return;
        }

        setLoading(true);
        try {
            const result = await authService.verifyOtp({ login: loginParam, otp });
            router.replace('/pages/onboarding/genderSelection' as any);
        } catch (error: any) {
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!loginParam || !canResend) { return; }
        setResending(true);
        try {
            await authService.sendOtp({ login: loginParam });
            showSuccessToast('verificationSent', languageCode);
            setCountdown(30);
            setCanResend(false);
        } catch (error: any) {
        } finally {
            setResending(false);
        }
    };

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
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{content.title}</Text>
                    <Text style={styles.subtitle}>{content.subtitle}</Text>

                    {loginParam ? (
                        <Text style={styles.loginHint}>{loginParam}</Text>
                    ) : null}

                    <View style={[styles.codeContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        {code.map((digit, index) => (
                            <View key={index} style={styles.digitBox}>
                                <TextInput
                                    ref={(ref) => { inputs.current[index] = ref; }}
                                    style={styles.digitInput}
                                    keyboardType="number-pad"
                                    maxLength={1}
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

                    <TouchableOpacity
                        style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.verifyButtonText}>{content.verifyButton || 'Verify'}</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        {canResend ? (
                            <TouchableOpacity onPress={handleResendOtp} disabled={resending}>
                                <Text style={styles.footerText}>
                                    {content.footerText}
                                    {resending ? (
                                        <ActivityIndicator size="small" color="#064E3B" />
                                    ) : (
                                        <Text style={styles.footerLink}>{content.footerLink}</Text>
                                    )}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.timerText}>
                                {isRTL
                                    ? `تم ارسال الرمز؟ يمكنك إعادة الإرسال بعد ${formatTime(countdown)} ثانية`
                                    : `Code sent? You can resend after ${formatTime(countdown)}`
                                }
                            </Text>
                        )}
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
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingVertical: Spacing.verticalSm,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingTop: Spacing.verticalXxxxl,
        alignItems: 'center',
    },
    title: {
        fontSize: FontSizes.h1,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: Spacing.verticalXs,
    },
    subtitle: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'center',
        marginBottom: Spacing.verticalXs,
        lineHeight: LineHeights.body,
    },
    loginHint: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
        marginBottom: Spacing.verticalXxxl,
    },
    codeContainer: {
        gap: Spacing.md,
        marginBottom: Spacing.verticalXxxxl,
        width: '100%',
        justifyContent: 'center',
    },
    digitBox: {
        flex: 1,
        height: scaleVertical(65),
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: 0.05,
        shadowRadius: scale(5),
    },
    digitInput: {
        fontSize: FontSizes.displayMedium,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        width: '100%',
        height: '100%',
    },
    verifyButton: {
        backgroundColor: '#064E3B',
        height: ButtonSizes.heightMedium,
        width: '100%',
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.verticalXxxxl,
    },
    verifyButtonDisabled: {
        opacity: 0.7,
    },
    verifyButtonText: {
        color: '#FFF',
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
    },
    footerLink: {
        color: '#064E3B',
        fontFamily: 'Cairo_700Bold',
    },
    timerText: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
        textAlign: 'center',
    },
});
