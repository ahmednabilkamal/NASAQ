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
import authService from '@/config/authService';
import Toast from 'react-native-toast-message';

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
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'رقم البطاقة يجب أن يكون 16 رقماً' });
            return;
        }
        if (!expiry || expiry.length < 5) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'أدخل تاريخ انتهاء صحيح (MM/YY)' });
            return;
        }
        if (!cvv || cvv.length < 3) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'أدخل رمز التحقق CVV' });
            return;
        }
        if (!cardName.trim()) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'أدخل اسم حامل البطاقة' });
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
            console.log('✅ Card saved response:', JSON.stringify(res));
            Toast.show({ type: 'success', text1: 'نجاح', text2: 'تم حفظ البطاقة بنجاح' });
            router.back();
        } catch (error: any) {
            console.error('Add card error:', error);
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'فشل حفظ البطاقة، حاولي مجدداً' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="chevron-forward" size={22} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>إضافة بطاقة جديدة</Text>
                <View style={{ width: 38 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Card Number */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>رقم البطاقة <Text style={styles.required}>*</Text></Text>
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

                    {/* Expiry + CVV row */}
                    <View style={styles.rowFields}>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.label}>الرمز الآمن (CVV) <Text style={styles.required}>*</Text></Text>
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
                            <Text style={styles.label}>تاريخ الانتهاء <Text style={styles.required}>*</Text></Text>
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

                    {/* Card Name */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>اسم مستخدم البطاقة (اختياري)</Text>
                        <TextInput
                            style={styles.input}
                            value={cardName}
                            onChangeText={setCardName}
                            placeholder="مثل: ميرار محمود"
                            textAlign="right"
                            placeholderTextColor="#CCC"
                        />
                    </View>

                    {/* Remember card checkbox */}
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setRememberCard(!rememberCard)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.checkbox, rememberCard && styles.checkboxActive]}>
                            {rememberCard && <Ionicons name="checkmark" size={13} color="#FFF" />}
                        </View>
                        <Text style={styles.checkboxLabel}>ذكر هذه البطاقة (اختياري)</Text>
                    </TouchableOpacity>

                    <Text style={styles.hint}>
                        هذا سيساعدك لتجد البطاقات بشكل أسهل مستقبلاً
                    </Text>

                    <View style={{ height: 80 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#FFF" />
                        : <Text style={styles.submitBtnText}>إضافة البطاقة</Text>
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
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFF',
    },
    headerBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'Cairo_700Bold', color: '#000' },
    scroll: { padding: 24, paddingTop: 28 },

    fieldGroup: { marginBottom: 20 },
    label: {
        fontSize: 13,
        fontFamily: 'Cairo_600SemiBold',
        color: '#555',
        textAlign: 'right',
        marginBottom: 8,
    },
    required: { color: '#E11D48' },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        height: 52,
        paddingHorizontal: 16,
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#111',
        borderWidth: 1,
        borderColor: '#EDEDED',
    },
    cardIconBadge: {
        width: 40,
        height: 52,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EDEDED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowFields: { flexDirection: 'row-reverse', gap: 12 },

    checkboxRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: { backgroundColor: '#064E3B', borderColor: '#064E3B' },
    checkboxLabel: { fontSize: 14, fontFamily: 'Cairo_400Regular', color: '#555', textAlign: 'right' },
    hint: { fontSize: 12, fontFamily: 'Cairo_400Regular', color: '#AAA', textAlign: 'right', marginTop: 2 },

    footer: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: 20,
        paddingBottom: 30,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    submitBtn: {
        backgroundColor: '#064E3B',
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Cairo_700Bold' },
});
