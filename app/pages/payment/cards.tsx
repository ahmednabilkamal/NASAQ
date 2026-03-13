import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Linking,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import authService from '@/config/authService';
import apiService from '@/config/apiService';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

export default function PaymentCardsScreen() {
    const router = useRouter();
    const { order_id, price } = useLocalSearchParams<{ order_id?: string; price?: string }>();

    // isCheckout = true when navigated from Book & Pay flow
    const isCheckout = Boolean(order_id);

    const [cards, setCards] = useState<any[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | number | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<'apple' | 'card'>('card');
    const [fetchingCards, setFetchingCards] = useState(true);
    const [paying, setPaying] = useState(false);

    const loadCards = useCallback(async (silent = false) => {
        if (!silent) setFetchingCards(true);
        try {
            const res = await authService.getCards();
            console.log('💳 Raw Cards Response:', JSON.stringify(res));

            /**
             * Handle Laravel ApiResponse structure:
             * Expected res format: { status: 'success', data: [ { id, last_four... } ] }
             * Falling back to res if it's already an array.
             */
            let fetched: any[] = [];
            if (Array.isArray(res)) {
                fetched = res;
            } else if (res && typeof res === 'object') {
                // Try .data first, then .cards, then look for any array value
                fetched = res.data ?? res.cards ?? Object.values(res).find(v => Array.isArray(v)) ?? [];
            }

            if (Array.isArray(fetched)) {
                console.log('✅ Parsed Cards:', fetched.length);
                setCards(fetched);
                if (fetched.length > 0 && !selectedCardId) {
                    setSelectedCardId(fetched[0].id);
                }
            } else {
                console.warn('⚠️ Fetched is not an array:', fetched);
                setCards([]);
            }
        } catch (e) {
            console.error('❌ Load cards error:', e);
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'تعذر تحميل البطاقات المحفوظة' });
        } finally {
            setFetchingCards(false);
        }
    }, [selectedCardId]);

    const onRefresh = useCallback(() => {
        loadCards(true);
    }, [loadCards]);

    useFocusEffect(
        useCallback(() => {
            loadCards();
        }, [loadCards])
    );

    const handleDeleteCard = async (cardId: string | number) => {
        Alert.alert('حذف البطاقة', 'هل تريدين حذف هذه البطاقة؟', [
            { text: 'إلغاء', style: 'cancel' },
            {
                text: 'حذف', style: 'destructive', onPress: async () => {
                    try {
                        await authService.deleteCard(Number(cardId));
                        setCards(prev => prev.filter(c => c.id !== cardId));
                        if (selectedCardId === cardId) setSelectedCardId(null);
                        Toast.show({ type: 'success', text1: 'تم الحذف', text2: 'تم حذف البطاقة بنجاح' });
                    } catch {
                        Toast.show({ type: 'error', text1: 'خطأ', text2: 'فشل حذف البطاقة' });
                    }
                }
            },
        ]);
    };

    const handlePay = async () => {
        if (!order_id) return;
        setPaying(true);
        try {
            const res = await apiService.initiatePayment(Number(order_id));
            const paymentUrl = (res?.data as any)?.payment_url;
            if (!paymentUrl) throw new Error('payment_url missing');
            const supported = await Linking.canOpenURL(paymentUrl);
            if (supported) {
                await Linking.openURL(paymentUrl);
            } else {
                Alert.alert('خطأ', 'تعذّر فتح صفحة الدفع.');
            }
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: error?.message || 'فشلت عملية الدفع' });
        } finally {
            setPaying(false);
        }
    };

    const displayPrice = price ? Number(price).toFixed(2) : null;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="chevron-forward" size={22} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isCheckout ? 'الدفع باستخدام' : 'بطاقاتي'}
                </Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scroll} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={fetchingCards} onRefresh={onRefresh} tintColor="#064E3B" />
                }
            >

                {/* Apple Pay */}
                <TouchableOpacity
                    style={[styles.methodRow, selectedMethod === 'apple' && styles.methodRowSelected]}
                    onPress={() => setSelectedMethod('apple')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.radio, selectedMethod === 'apple' && styles.radioActive]}>
                        {selectedMethod === 'apple' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.methodLabel}>Apple Pay</Text>
                    <View style={styles.applePayBadge}>
                        <Ionicons name="logo-apple" size={16} color="#000" />
                        <Text style={styles.applePayText}> Pay</Text>
                    </View>
                </TouchableOpacity>

                {/* Debit / Credit Card toggle */}
                <TouchableOpacity
                    style={[styles.methodRow, selectedMethod === 'card' && styles.methodRowSelected]}
                    onPress={() => setSelectedMethod('card')}
                    activeOpacity={0.8}
                >
                    <View style={[styles.radio, selectedMethod === 'card' && styles.radioActive]}>
                        {selectedMethod === 'card' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.methodLabel}>Debit/Credit Card</Text>
                    <Ionicons name="card" size={22} color="#064E3B" />
                </TouchableOpacity>

                {/* ── Saved cards (visible when card method selected) ── */}
                {selectedMethod === 'card' && (
                    <View style={styles.savedCardBlock}>
                        {fetchingCards ? (
                            <ActivityIndicator color="#064E3B" style={{ margin: 20 }} />
                        ) : cards.length === 0 ? (
                            /* No cards yet */
                            <View style={styles.emptyCards}>
                                <Ionicons name="card-outline" size={36} color="#DDD" />
                                <Text style={styles.emptyCardsText}>لا توجد بطاقات محفوظة</Text>
                            </View>
                        ) : (
                            cards.map(card => (
                                <TouchableOpacity
                                    key={card.id}
                                    style={[
                                        styles.savedCardRow,
                                        selectedCardId === card.id && styles.savedCardRowSelected,
                                    ]}
                                    onPress={() => setSelectedCardId(card.id)}
                                    activeOpacity={0.85}
                                >
                                    {/* Left: radio */}
                                    <View style={[styles.radioSm, selectedCardId === card.id && styles.radioSmActive]}>
                                        {selectedCardId === card.id && <View style={styles.radioDotSm} />}
                                    </View>

                                    {/* Card info */}
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardDigits}>•••• {card.last_four}</Text>
                                        <Text style={styles.cardHolder}>{card.card_name}</Text>
                                    </View>

                                    {/* Card type icon */}
                                    <Ionicons
                                        name={card.card_type === 'visa' ? 'card' : 'card-outline'}
                                        size={22}
                                        color="#1A1F71"
                                    />

                                    {/* Delete */}
                                    <TouchableOpacity
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        onPress={() => handleDeleteCard(card.id)}
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))
                        )}

                        {/* Add new card row */}
                        <TouchableOpacity
                            style={styles.addCardRow}
                            onPress={() => router.push('/pages/payment/add_card' as any)}
                        >
                            <Text style={styles.addCardText}>إضافة بطاقة جديدة</Text>
                            <Ionicons name="add-circle-outline" size={20} color="#064E3B" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Payment Summary (only in checkout mode) ── */}
                {isCheckout && displayPrice && (
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryTitle}>ملخص الدفع</Text>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryTotal}>ر.س {displayPrice}</Text>
                            <Text style={styles.summaryLabel}>الإجمالي (شامل الضريبة)</Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* ── Footer: Pay (checkout) or Manage (card-only) ── */}
            <View style={styles.footer}>
                {isCheckout ? (
                    <TouchableOpacity
                        style={[styles.payBtn, paying && { opacity: 0.7 }]}
                        onPress={handlePay}
                        disabled={paying}
                    >
                        {paying
                            ? <ActivityIndicator color="#FFF" />
                            : <Text style={styles.payBtnText}>ادفع</Text>
                        }
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.payBtn}
                        onPress={() => router.push('/pages/payment/add_card' as any)}
                    >
                        <Ionicons name="add" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                        <Text style={styles.payBtnText}>إضافة بطاقة</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'Cairo_700Bold', color: '#000' },
    scroll: { padding: 20 },

    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        gap: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    methodRowSelected: { borderColor: '#064E3B', backgroundColor: '#F7FAF9' },
    radio: {
        width: 20, height: 20, borderRadius: 10,
        borderWidth: 2, borderColor: '#DDD',
        justifyContent: 'center', alignItems: 'center',
    },
    radioActive: { borderColor: '#064E3B' },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#064E3B' },
    methodLabel: { flex: 1, fontSize: 14, fontFamily: 'Cairo_700Bold', color: '#111', textAlign: 'right' },
    applePayBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    applePayText: { fontSize: 13, fontFamily: 'Cairo_700Bold', color: '#000' },

    savedCardBlock: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    emptyCards: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    emptyCardsText: { fontSize: 14, fontFamily: 'Cairo_400Regular', color: '#AAA' },

    savedCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    savedCardRowSelected: { backgroundColor: '#F7FAF9' },
    radioSm: {
        width: 18, height: 18, borderRadius: 9,
        borderWidth: 2, borderColor: '#DDD',
        justifyContent: 'center', alignItems: 'center',
    },
    radioSmActive: { borderColor: '#064E3B' },
    radioDotSm: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#064E3B' },
    cardInfo: { flex: 1, alignItems: 'flex-end' },
    cardDigits: { fontSize: 15, fontFamily: 'Cairo_700Bold', color: '#1F2937', letterSpacing: 1 },
    cardHolder: { fontSize: 11, fontFamily: 'Cairo_400Regular', color: '#9CA3AF', marginTop: 2 },

    addCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        padding: 14,
        paddingHorizontal: 16,
    },
    addCardText: { fontSize: 14, fontFamily: 'Cairo_700Bold', color: '#064E3B' },

    summaryBox: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    summaryTitle: { fontSize: 16, fontFamily: 'Cairo_700Bold', color: '#000', textAlign: 'center', marginBottom: 16 },
    summaryDivider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 14 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: 13, fontFamily: 'Cairo_600SemiBold', color: '#6B7280' },
    summaryTotal: { fontSize: 20, fontFamily: 'Cairo_700Bold', color: '#000' },

    footer: { padding: 20, paddingBottom: 28, backgroundColor: '#F8F9FA' },
    payBtn: {
        backgroundColor: '#064E3B',
        height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#064E3B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    payBtnText: { color: '#FFF', fontSize: 18, fontFamily: 'Cairo_700Bold' },
});
