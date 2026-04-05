import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection, stylistScreenDirection } from '@/config/rtlLayout';
import { rtlInput, rtlText } from '@/config/rtlText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import { useAuth } from '@/config/authContext';
import { isStylistUser } from '@/config/navigationFlow';
import apiService, { Order } from '@/config/apiService';

export default function TicketNewScreen() {
    const router = useRouter();
    const { order_id: orderIdParam } = useLocalSearchParams<{ order_id?: string }>();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const isStylist = isStylistUser(user);
    const screenDir = isStylist ? stylistScreenDirection : userScreenDirection;

    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [orderId, setOrderId] = useState<number | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        const raw = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;
        if (raw != null && String(raw) !== '') {
            const n = Number(raw);
            if (Number.isFinite(n)) setOrderId(n);
        }
    }, [orderIdParam]);

    const loadOrders = useCallback(async () => {
        setLoadingOrders(true);
        try {
            const res = isStylist
                ? await apiService.getStylistOrders({ per_page: 30 })
                : await apiService.getUserOrders({ per_page: 30 });
            const list = Array.isArray(res?.data) ? res.data : [];
            setOrders(list);
        } catch {
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    }, [isStylist]);

    useEffect(() => {
        if (isAuthenticated) loadOrders();
    }, [isAuthenticated, loadOrders]);

    const submit = async () => {
        const s = subject.trim();
        if (s.length < 3) {
            Alert.alert('تنبيه', 'أدخل عنواناً للتذكرة (3 أحرف على الأقل).');
            return;
        }
        const b = body.trim();
        if (b.length < 1) {
            Alert.alert('تنبيه', 'أدخل نص الطلب أو وصف المشكلة.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await apiService.createTicket({
                subject: s,
                body: b,
                ...(orderId != null ? { order_id: orderId } : {}),
            });
            const tid = (res?.data as { id?: number | string } | undefined)?.id;
            if (tid != null) {
                router.replace({ pathname: '/pages/ticket_detail' as any, params: { id: String(tid) } });
            } else {
                router.back();
            }
        } catch {
            /* axios toast */
        } finally {
            setSubmitting(false);
        }
    };

    const orderLine = (o: Order) => {
        const anyo = o as Record<string, unknown>;
        const title =
            (anyo.service as { title?: string } | undefined)?.title || `طلب #${o.id}`;
        const oid = Number(o.id);
        const selected = orderId === oid;
        return (
            <TouchableOpacity
                key={String(o.id)}
                style={[styles.orderChip, selected && styles.orderChipOn]}
                onPress={() => setOrderId(selected ? null : oid)}
            >
                <Text style={[styles.orderChipText, selected && styles.orderChipTextOn]} numberOfLines={1}>
                    #{o.id} · {title}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, screenDir]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
                    <Ionicons name={getBackChevron()} size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>تذكرة جديدة</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>الموضوع</Text>
                <TextInput
                    style={[styles.input, rtlInput]}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="موضوع مختصر"
                    placeholderTextColor="#9CA3AF"
                />

                <Text style={styles.label}>الوصف</Text>
                <TextInput
                    style={[styles.input, styles.textArea, rtlInput]}
                    value={body}
                    onChangeText={setBody}
                    placeholder="صف المشكلة أو طلبك..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                />

                <Text style={styles.label}>ربط بطلب (اختياري)</Text>
                <Text style={styles.hint}>اختر طلباً لربطه بالتذكرة، أو «بدون ربط».</Text>
                {loadingOrders ? (
                    <ActivityIndicator style={{ marginVertical: 12 }} color="#064E3B" />
                ) : orders.length === 0 ? (
                    <Text style={styles.muted}>لا توجد طلبات لعرضها.</Text>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.orderScroll}>
                        <TouchableOpacity
                            style={[styles.orderChip, orderId === null && styles.orderChipOn]}
                            onPress={() => setOrderId(null)}
                        >
                            <Text style={[styles.orderChipText, orderId === null && styles.orderChipTextOn]}>
                                بدون ربط
                            </Text>
                        </TouchableOpacity>
                        {orders.map(orderLine)}
                    </ScrollView>
                )}

                <TouchableOpacity
                    style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                    onPress={submit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitText}>إرسال التذكرة</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: { fontSize: 18, fontFamily: 'Cairo_700Bold', color: '#111' },
    scroll: { padding: 16, paddingBottom: 40 },
    label: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#374151',
        marginBottom: 8,
        marginTop: 12,
        ...rtlText.alignStart,
    },
    hint: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        marginBottom: 8,
        ...rtlText.alignStart,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#111',
    },
    textArea: { minHeight: 120, paddingTop: 12 },
    orderScroll: { flexGrow: 0, marginBottom: 8 },
    orderChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginEnd: 8,
        maxWidth: 260,
    },
    orderChipOn: { backgroundColor: '#ECFDF5', borderColor: '#064E3B' },
    orderChipText: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: '#374151' },
    orderChipTextOn: { color: '#064E3B', fontFamily: 'Cairo_600SemiBold' },
    muted: { color: '#6B7280', fontFamily: 'Cairo_400Regular', marginVertical: 8, ...rtlText.alignStart },
    submitBtn: {
        backgroundColor: '#064E3B',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    submitText: { color: '#FFF', fontFamily: 'Cairo_700Bold', fontSize: 16 },
});
