import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import authService from '@/config/authService';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { InputSizes, ButtonSizes } from '@/utils/spacing';
import { showErrorToast, showSuccessToast } from '@/utils/errorHandler';

function formatCardNumber(raw: string) {
    return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
}

export default function AddCardScreen() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode]?.payment || (pageData as any)['en'].payment;

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [rememberCard, setRememberCard] = useState(true);
    const [loading, setLoading] = useState(false);

    const rawNumber = cardNumber.replace(/\s/g, '');
    const isVisa = rawNumber.startsWith('4');
    const isMaster = rawNumber.startsWith('5');

    const handleSave = async () => {
        if (rawNumber.length < 16) {
            showErrorToast('', languageCode, 'رقم البطاقة يجب أن يكون 16 رقماً');
            return;
        }
        if (!expiry || expiry.length < 5) {
            showErrorToast('', languageCode, 'أدخل تاريخ انتهاء صحيح (MM/YY)');
            return;
        }
        if (!cvv || cvv.length < 3) {
            showErrorToast('', languageCode, 'أدخل رمز التحقق CVV');
            return;
        }
        if (!cardName.trim()) {
            showErrorToast('allFieldsRequired', languageCode);
            return;
        }

        setLoading(true);
        try {
            const cardType = isVisa ? 'visa' : isMaster ? 'mastercard' : 'card';
            const res = await authService.storeCard({
                card_name: cardName.trim(),
                last_four: rawNumber.slice(-4),
                card_type: cardType,
            });
            showSuccessToast('cardSaved', languageCode);
            router.back();
        } catch (error: any) {
            showErrorToast('saveFailed', languageCode);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="chevron-forward" size={22} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{content.addCard}</Text>
                <View style={{ width: 38 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{content.cardNumber} <Text style={styles.required}>*</Text></Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={cardNumber}
                                onChangeText={t => setCardNumber(formatCardNumber(t))}
                                placeholder="أدخل رقم بطاقتك"
                                keyboardType="numeric"
                                maxLength={19}
                                textAlign="right"
                                placeholderTextColor="#CCC"
                            />
                            {(isVisa || isMaster) && (
                                <View style={styles.cardIconBadge}>
                                    <Ionicons name="card" size={20} color={isVisa ? '#1A1F71' : '#EB001B'} />
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.rowFields}>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.label}>{content.cvv} <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                value={cvv}
                                onChangeText={setCvv}
                                placeholder="الرمز الآمن"
                                keyboardType="numeric"
                                maxLength={4}
                                secureTextEntry
                                textAlign="right"
                                placeholderTextColor="#CCC"
                            />
                        </View>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.label}>{content.expiryDate} <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                value={expiry}
                                onChangeText={t => setExpiry(formatExpiry(t))}
                                placeholder="الشهر/السنة"
                                keyboardType="numeric"
                                maxLength={5}
                                textAlign="right"
                                placeholderTextColor="#CCC"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{content.cardNickname}</Text>
                        <TextInput
                            style={styles.input}
                            value={cardName}
                            onChangeText={setCardName}
                            placeholder="مثل: ميرار محمود"
                            textAlign="right"
                            placeholderTextColor="#CCC"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setRememberCard(!rememberCard)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.checkbox, rememberCard && styles.checkboxActive]}>
                            {rememberCard && <Ionicons name="checkmark" size={13} color="#FFF" />}
                        </View>
                        <Text style={styles.checkboxLabel}>{content.saveCard}</Text>
                    </TouchableOpacity>

                    <Text style={styles.hint}>
                        هذا سيساعدك لتجد البطاقات بشكل أسهل مستقبلاً
                    </Text>

                    <View style={{ height: 80 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#FFF" />
                        : <Text style={styles.submitBtnText}>{content.addCard}</Text>
                    }
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.verticalSm,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFF',
    },
    headerBtn: { width: scale(38), height: scale(38), justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: FontSizes.h4, fontFamily: 'Cairo_700Bold', color: '#000' },
    scroll: { padding: Spacing.xxxxl, paddingTop: Spacing.xxxxl },

    fieldGroup: { marginBottom: Spacing.xl },
    label: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_600SemiBold',
        color: '#555',
        textAlign: 'right',
        marginBottom: Spacing.verticalXs,
    },
    required: { color: '#E11D48' },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: BorderRadius.md,
        height: InputSizes.height,
        paddingHorizontal: InputSizes.paddingHorizontal,
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_400Regular',
        color: '#111',
        borderWidth: 1,
        borderColor: '#EDEDED',
    },
    cardIconBadge: {
        width: scale(40),
        height: InputSizes.height,
        backgroundColor: '#F8F9FA',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: '#EDEDED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowFields: { flexDirection: 'row-reverse', gap: Spacing.md },

    checkboxRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.verticalXs,
    },
    checkbox: {
        width: scale(20),
        height: scale(20),
        borderRadius: BorderRadius.sm,
        borderWidth: 1.5,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: { backgroundColor: '#064E3B', borderColor: '#064E3B' },
    checkboxLabel: { fontSize: FontSizes.body, fontFamily: 'Cairo_400Regular', color: '#555', textAlign: 'right' },
    hint: { fontSize: FontSizes.caption, fontFamily: 'Cairo_400Regular', color: '#AAA', textAlign: 'right', marginTop: Spacing.verticalXs },

    footer: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: Spacing.xl,
        paddingBottom: Spacing.verticalXxxxl,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    submitBtn: {
        backgroundColor: '#064E3B',
        height: ButtonSizes.heightMedium,
        borderRadius: BorderRadius.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: { color: '#FFF', fontSize: FontSizes.bodyLarge, fontFamily: 'Cairo_700Bold' },
});
