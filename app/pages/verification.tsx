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
    I18nManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function VerificationScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.verification || (pageData as any)['en'].verification;

    const isRTL = I18nManager.isRTL;
    const [code, setCode] = useState(['', '', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 4) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
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
                        <IconSymbol
                            name={isRTL ? 'chevron.right' : 'chevron.left'}
                            size={24}
                            color="#000"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{content.title}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{content.title}</Text>
                    <Text style={styles.subtitle}>{content.subtitle}</Text>

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
                                />
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={() => router.push('/pages/onboarding/page1' as any)}
                    >
                        <Text style={styles.verifyButtonText}>Verify</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <TouchableOpacity>
                            <Text style={styles.footerText}>
                                {content.footerText}
                                <Text style={styles.footerLink}>{content.footerLink}</Text>
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
        marginBottom: 40,
        lineHeight: 20,
    },
    codeContainer: {
        gap: 12,
        marginBottom: 40,
        width: '100%',
        justifyContent: 'center',
    },
    digitBox: {
        width: 55,
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
