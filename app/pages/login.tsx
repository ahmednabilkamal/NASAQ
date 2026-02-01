import React from 'react';
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
    Image,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthForm } from './hooks/useAuthForm';

export default function AuthScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const { isLogin, setAuthMode, toggleAuthMode, handleNext } = useAuthForm();

    const content = (pageData as any)[languageCode];
    const loginContent = content.login;
    const registerContent = content.register;
    const currentContent = isLogin ? loginContent : registerContent;

    const isRTL = I18nManager.isRTL;

    return (
        <SafeAreaView style={styles.container}>
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
                                    />
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={handleNext}
                        >
                            <Text style={styles.nextButtonText}>{loginContent.nextButton}</Text>
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>أو</Text>
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
        </SafeAreaView>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: I18nManager.isRTL ? 'flex-start' : 'flex-end',
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
        textAlign: I18nManager.isRTL ? 'right' : 'left',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        textAlign: I18nManager.isRTL ? 'right' : 'left',
        marginBottom: 30,
        lineHeight: 20,
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
    },
    activeTabText: {
        color: '#FFF',
    },
    form: {
        gap: 20,
    },
    inputWrapper: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#666',
        textAlign: I18nManager.isRTL ? 'right' : 'left',
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
    },
    input: {
        fontSize: 16,
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
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: '#FFF',
    },
    rememberMeText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
    },
    nextButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginVertical: 10,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#EEE',
    },
    dividerText: {
        fontSize: 14,
        color: '#999',
        fontFamily: 'Cairo_400Regular',
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        height: 55,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    googleIcon: {
        width: 20,
        height: 20,
    },
    googleButtonText: {
        fontSize: 16,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
    },
    footer: {
        alignItems: 'center',
        marginTop: 10,
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#666',
    },
    footerLink: {
        color: '#10B981',
        fontFamily: 'Cairo_700Bold',
    },
});
