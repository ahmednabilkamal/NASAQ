import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SAVED_CARDS = [
    {
        id: '1',
        type: 'visa',
        lastFour: '5682',
        expiry: '09/25',
    },
];

export default function PaymentCardsScreen() {
    const router = useRouter();
    const [selectedCard, setSelectedCard] = useState('1');

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>الدفع بإستخدام</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Apple Pay Option */}
                <TouchableOpacity style={styles.paymentOption}>
                    <View style={styles.checkboxContainer}>
                        <View style={styles.checkbox} />
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
                    <TouchableOpacity style={[styles.paymentOption, styles.selectedOption]}>
                        <View style={styles.checkboxContainer}>
                            <View style={[styles.checkbox, styles.checkboxSelected]}>
                                <Ionicons name="checkmark" size={14} color="#FFF" />
                            </View>
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentLabel}>Debit/Credit Card</Text>
                            <Text style={styles.paymentSublabel}>تعديل / اضافة</Text>
                        </View>
                        <Ionicons name="card" size={24} color="#064E3B" />
                    </TouchableOpacity>

                    {/* Saved Card */}
                    {SAVED_CARDS.map((card) => (
                        <View key={card.id} style={styles.savedCard}>
                            <View style={styles.cardRow}>
                                <Text style={styles.cardNumber}>**** {card.lastFour}</Text>
                                <Ionicons name="card" size={20} color="#1A1F71" />
                            </View>
                            <View style={styles.cardRow}>
                                <Text style={styles.cvvLabel}>CVV</Text>
                            </View>
                        </View>
                    ))}

                    {/* Add New Card */}
                    <TouchableOpacity
                        style={styles.addCardButton}
                        onPress={() => router.push('/pages/payment/add_card' as any)}
                    >
                        <Text style={styles.addCardText}>إضافة بطاقة جديدة</Text>
                        <Ionicons name="add-circle-outline" size={20} color="#064E3B" />
                    </TouchableOpacity>
                </View>

                {/* Payment Summary */}
                <View style={styles.summarySection}>
                    <Text style={styles.summaryTitle}>ملخص الدفع</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryValue}>1,234.70 ر.س</Text>
                        <Text style={styles.summaryLabel}>الإجمالي (شامل الضريبة)</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Pay Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.payButton}>
                    <Text style={styles.payButtonText}>ادفع</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
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
        color: '#FFF',
    },
    scrollContent: {
        padding: 20,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
    },
    selectedOption: {
        borderWidth: 1,
        borderColor: '#064E3B',
    },
    checkboxContainer: {
        marginLeft: 15,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#444',
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
        fontFamily: 'Cairo_600SemiBold',
        color: '#FFF',
    },
    paymentSublabel: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    applePayIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardSection: {
        marginTop: 10,
    },
    savedCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        marginLeft: 40,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
        marginBottom: 8,
    },
    cardNumber: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#FFF',
    },
    cvvLabel: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    addCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        padding: 15,
    },
    addCardText: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#064E3B',
    },
    summarySection: {
        marginTop: 30,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 20,
    },
    summaryTitle: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 15,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    summaryValue: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#FFF',
    },
    footer: {
        padding: 20,
    },
    payButton: {
        backgroundColor: '#064E3B',
        height: 55,
        borderRadius: 27.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
    },
});
