import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';

export default function AddCardScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.payment || (pageData as any)['en'].payment;
    const isRTL = I18nManager.isRTL;

    const [rememberCard, setRememberCard] = useState(true);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{content.addCard}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {}
                <View style={styles.cardPreview}>
                    <Image
                        source={require('@/assets/page1bg.png')}
                        style={styles.cardPreviewImage}
                    />
                </View>

                {}
                <View style={styles.form}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>{content.cardNumber}<Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="أدخل رقم بطاقتك"
                            keyboardType="numeric"
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <Text style={styles.label}>{content.expiryDate}<Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="الشهر/السنة"
                                keyboardType="numeric"
                                textAlign={isRTL ? 'right' : 'left'}
                            />
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <Text style={styles.label}>{content.cvv}<Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="الرمز الآمن"
                                keyboardType="numeric"
                                maxLength={3}
                                textAlign={isRTL ? 'right' : 'left'}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>{content.cardNickname}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="مثل: ميرار محمود"
                            textAlign={isRTL ? 'right' : 'left'}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setRememberCard(!rememberCard)}
                    >
                        <View style={[styles.checkbox, rememberCard && styles.checkboxActive]}>
                            {rememberCard && <Ionicons name="checkmark" size={14} color="#FFF" />}
                        </View>
                        <Text style={styles.checkboxLabel}>{content.saveCard}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>{content.addCard}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    content: {
        padding: 20,
    },
    cardPreview: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 30,
    },
    cardPreviewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
    },
    required: {
        color: '#E11D48',
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        height: 55,
        paddingHorizontal: 20,
        fontSize: 16,
        fontFamily: 'Cairo_400Regular',
    },
    row: {
        flexDirection: 'row',
        gap: 15,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#064E3B',
        borderColor: '#064E3B',
    },
    checkboxLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    submitButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
    },
});
