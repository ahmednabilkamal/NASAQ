import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import authService from '@/config/authService';

export default function VerificationScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.verification || (pageData as any)['ar'].verification;
    const { login: loginParam } = useLocalSearchParams<{ login?: string }>();

    const [code, setCode] = useState(['', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const inputs = useRef<(TextInput | null)[]>([]);

    const handleCodeChange = (text: string, index: number) => {
        // If user pastes or types multiple characters, just take the last one or handle as needed
        // But here maxLength={1} handles it.
        const char = text.slice(-1);
        
        const newCode = [...code];
        newCode[index] = char;
        setCode(newCode);

        // Move to next input if a digit was entered
        if (char && index < 4) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
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
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إدخال رمز التحقق كاملاً' });
            return;
        }
        if (!loginParam) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'لم يتم العثور على بيانات التحقق' });
            return;
        }

        setLoading(true);
        try {
            const result = await authService.verifyOtp({ login: loginParam, otp });
            console.log('OTP Verification Response:', result);
            // Token is stored by verifyOtp; navigate to onboarding starting with gender selection
            router.replace('/pages/onboarding/genderSelection' as any);

        } catch (error: any) {
            // Handled globally
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!loginParam) { return; }
        setResending(true);
        try {
            await authService.sendOtp({ login: loginParam });
            Toast.show({ type: 'success', text1: 'تم', text2: 'تم إرسال رمز التحقق مرة أخرى' });
        } catch (error: any) {
            // Handled by axios interceptor
        } finally {
            setResending(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name={getBackChevron()} size={24} color="#000" />
                    </TouchableOpacity>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{content.title}</Text>
                    <Text style={styles.subtitle}>{content.subtitle}</Text>

                    {loginParam ? (
                        <Text style={styles.loginHint}>{loginParam}</Text>
                    ) : null}

                    <View style={styles.codeContainer}>
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
                            <Text style={styles.verifyButtonText}>تحقق</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 8,
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
    },
    codeContainer: {
        gap: 12,
        marginBottom: 40,
        width: '100%',
        justifyContent: 'center',
    },
    digitBox: {
        flex: 1,
        height: 65,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    digitInput: {
        fontSize: 24,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        width: '100%',
        height: '100%',
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
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
    },
    footerLink: {
        color: '#064E3B',
        fontFamily: 'Cairo_700Bold',
    },
});
