import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import SarPriceText from '@/components/SarPriceText';

export default function CheckoutScreen() {
    const router = useRouter();
    const { service_id, service_title, price } = useLocalSearchParams<{ service_id?: string; service_title?: string; price?: string }>();

    const amount = Number(price || 0);
    const formatted = Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
    const decodedServiceTitle = service_title ? decodeURIComponent(String(service_title)) : undefined;

    return (
        <SafeAreaView style={[styles.container, userScreenDirection]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name={getBackChevron()} size={22} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>إتمام الطلب</Text>
                <View style={{ width: 38 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>الخدمة المختارة</Text>
                    <Text style={styles.value}>{decodedServiceTitle || '-'}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>الإجمالي</Text>
                    <SarPriceText value={Number.isFinite(amount) ? amount : 0} textStyle={styles.total} />
                </View>

                <Text style={styles.note}>
                    اختر طريقة الدفع من الصفحة التالية. إذا كانت بوابة الدفع غير متاحة حالياً، سيبقى الطلب محفوظاً ويمكنك إكمال الدفع لاحقاً.
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() =>
                        router.push(
                            `/pages/payment/cards?service_id=${service_id || ''}&price=${formatted}` as any
                        )
                    }
                >
                    <Text style={styles.payBtnText}>اختيار طريقة الدفع</Text>
                </TouchableOpacity>
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
    headerTitle: { fontSize: 18, fontFamily: 'Cairo_700Bold', color: '#111' },
    content: { padding: 20, gap: 12 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    label: { fontSize: 13, fontFamily: 'Cairo_400Regular', color: '#6B7280', textAlign: 'right' },
    value: { fontSize: 18, fontFamily: 'Cairo_700Bold', color: '#111827', textAlign: 'right' },
    total: { fontSize: 22, fontFamily: 'Cairo_700Bold', color: '#064E3B', textAlign: 'right' },
    note: {
        marginTop: 10,
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        lineHeight: 22,
        textAlign: 'right',
    },
    footer: { marginTop: 'auto', padding: 20, paddingBottom: 28 },
    payBtn: {
        backgroundColor: '#064E3B',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payBtnText: { color: '#FFF', fontSize: 17, fontFamily: 'Cairo_700Bold' },
});

