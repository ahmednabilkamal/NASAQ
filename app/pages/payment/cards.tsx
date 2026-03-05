import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    ActivityIndicator,
    I18nManager,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import authService from '@/config/authService';
import Toast from 'react-native-toast-message';

export default function PaymentCardsScreen() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<'apple' | 'card'>('card');
    const [isModalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cards, setCards] = useState<any[]>([]);
    const [fetchingCards, setFetchingCards] = useState(true);
    const [selectedCardId, setSelectedCardId] = useState<string | number | null>(null);

    // Form State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = async () => {
        try {
            const res = await authService.getCards();
            if (res.status === 'success' || res.data) {
                const fetchedCards = res.data || [];
                setCards(fetchedCards);
                if (fetchedCards.length > 0 && !selectedCardId) {
                    setSelectedCardId(fetchedCards[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setFetchingCards(false);
        }
    };

    const handleAddCard = async () => {
        if (cardNumber.length < 16 || !cvv || !expiry || !cardName) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إكمال بيانات البطاقة' });
            return;
        }

        setLoading(true);
        try {
            const lastFour = cardNumber.slice(-4);
            const cardType = cardNumber.startsWith('4') ? 'visa' : (cardNumber.startsWith('5') ? 'mastercard' : 'card');

            const res = await authService.storeCard({
                card_name: cardName,
                last_four: lastFour,
                card_type: cardType
            });

            if (res.status === 'success' || res.data) {
                Toast.show({ type: 'success', text1: 'نجاح', text2: 'تم حفظ البطاقة بنجاح' });
                setModalVisible(false);
                setCardNumber('');
                setExpiry('');
                setCvv('');
                setCardName('');
                await loadCards();
                setSelectedMethod('card');
                if (res.data && res.data.id) {
                    setSelectedCardId(res.data.id);
                }
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'فشل حفظ البطاقة' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>الدفع بإستخدام</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Apple Pay Option */}
                <TouchableOpacity
                    style={[styles.paymentOption, selectedMethod === 'apple' && styles.selectedOption]}
                    onPress={() => setSelectedMethod('apple')}
                >
                    <View style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, selectedMethod === 'apple' && styles.checkboxSelected]}>
                            {selectedMethod === 'apple' && <Ionicons name="checkmark" size={14} color="#FFF" />}
                        </View>
                    </View>
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentLabel}>Apple Pay</Text>
                    </View>
                    <View style={styles.applePayIcon}>
                        <Ionicons name="logo-apple" size={24} color="#000" />
                    </View>
                </TouchableOpacity>

                {/* Debit/Credit Card Option */}
                <View style={styles.cardSection}>
                    <TouchableOpacity
                        style={[styles.paymentOption, selectedMethod === 'card' && styles.selectedOption]}
                        onPress={() => setSelectedMethod('card')}
                    >
                        <View style={styles.checkboxContainer}>
                            <View style={[styles.checkbox, selectedMethod === 'card' && styles.checkboxSelected]}>
                                {selectedMethod === 'card' && <Ionicons name="checkmark" size={14} color="#FFF" />}
                            </View>
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentLabel}>Debit/Credit Card</Text>
                        </View>
                        <Ionicons name="card" size={24} color="#064E3B" />
                    </TouchableOpacity>

                    {/* Saved Cards Section */}
                    {cards.length > 0 && (
                        <View style={styles.savedCardsSection}>
                            <Text style={styles.sectionHeading}>البطاقات المحفوظة</Text>
                            {cards.map((card, index) => (
                                <TouchableOpacity
                                    key={card.id || index}
                                    style={[
                                        styles.savedCardItem,
                                        selectedMethod === 'card' && selectedCardId === card.id && styles.selectedSavedCard
                                    ]}
                                    onPress={() => {
                                        setSelectedMethod('card');
                                        setSelectedCardId(card.id);
                                    }}
                                >
                                    <View style={StyleSheet.flatten([styles.cardInfoRow, { justifyContent: 'space-between' }])}>
                                        {selectedMethod === 'card' && selectedCardId === card.id && (
                                            <View style={styles.miniCheckbox}>
                                                <Ionicons name="checkmark" size={12} color="#FFF" />
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }} />
                                        <View style={styles.cardInfoRow}>
                                            <Text style={styles.cardNumberText}>**** {card.last_four}</Text>
                                            <Ionicons
                                                name={card.card_type === 'visa' ? "card" : "card-outline"}
                                                size={20}
                                                color="#1A1F71"
                                            />
                                        </View>
                                    </View>
                                    <Text style={styles.cardHolderName}>{card.card_name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Add New Card Button */}
                    <TouchableOpacity
                        style={styles.addCardButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.addCardText}>إضافة بطاقة جديدة</Text>
                        <Ionicons name="add-circle-outline" size={20} color="#064E3B" />
                    </TouchableOpacity>

                </View>

                {/* Summary Section */}
                <View style={styles.summarySection}>
                    <Text style={styles.summaryTitle}>ملخص الدفع</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryValue}>1,234.70 ر.س</Text>
                        <Text style={styles.summaryLabel}>الإجمالي (شامل الضريبة)</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Pay Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.payButton}>
                    <Text style={styles.payButtonText}>ادفع</Text>
                </TouchableOpacity>
            </View>

            {/* Add Card Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>إضافة بطاقة جديدة</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>الاسم على البطاقة</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={cardName}
                                        onChangeText={setCardName}
                                        placeholder="مثلاً: محمد أحمد"
                                        textAlign="right"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>رقم البطاقة</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={cardNumber}
                                        onChangeText={setCardNumber}
                                        placeholder="0000 0000 0000 0000"
                                        keyboardType="numeric"
                                        maxLength={16}
                                        textAlign="right"
                                    />
                                </View>

                                <View style={styles.rowInputs}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.inputLabel}>التاريخ (MM/YY)</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={expiry}
                                            onChangeText={setExpiry}
                                            placeholder="MM/YY"
                                            keyboardType="numeric"
                                            maxLength={5}
                                            textAlign="right"
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                                        <Text style={styles.inputLabel}>رقم التحقق (CVV)</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={cvv}
                                            onChangeText={setCvv}
                                            placeholder="123"
                                            keyboardType="numeric"
                                            maxLength={3}
                                            secureTextEntry
                                            textAlign="right"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitButton, loading && { opacity: 0.7 }]}
                                    onPress={handleAddCard}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>حفظ البطاقة</Text>}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    scrollContent: {
        padding: 20,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    selectedOption: {
        borderWidth: 1,
        borderColor: '#064E3B',
        backgroundColor: '#F7FAF9',
    },
    checkboxContainer: {
        marginLeft: 15,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    checkboxSelected: {
        backgroundColor: '#064E3B',
        borderColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentInfo: {
        flex: 1,
        alignItems: 'flex-end',
        marginRight: 12,
    },
    paymentLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    paymentSublabel: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#064E3B',
        marginTop: 2,
    },
    applePayIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardSection: {
        marginTop: 10,
    },
    addCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        padding: 15,
        marginTop: 4,
    },
    addCardText: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    summarySection: {
        marginTop: 30,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 5,
    },
    summaryTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 15,
    },
    summaryLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#F8F9FB',
    },
    payButton: {
        backgroundColor: '#064E3B',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#064E3B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    payButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
    },

    // New styles for saved cards
    savedCardsSection: {
        marginTop: 20,
        marginBottom: 10,
    },
    sectionHeading: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#999',
        textAlign: 'right',
        marginBottom: 12,
        marginRight: 10,
    },
    savedCardItem: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginLeft: 40,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    selectedSavedCard: {
        borderColor: '#064E3B',
        backgroundColor: '#F7FAF9',
    },
    miniCheckbox: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    cardInfoRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
    },
    cardNumberText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#1F2937',
    },
    cardHolderName: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        textAlign: 'right',
        marginTop: 4,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#F8F9FB',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
    },
    formContainer: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
        textAlign: 'right',
    },
    textInput: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: '#EEE',
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
    },
    rowInputs: {
        flexDirection: 'row',
    },
    submitButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 27.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
    }
});
