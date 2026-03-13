import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/config/authContext';
import BottomNav from '@/components/BottomNav';
import { Ionicons } from '@expo/vector-icons';
import apiService, { Order } from '@/config/apiService';

const STATUS_MAP: Record<string, string[]> = {
    all:     [],                                          // no filter
    new:     ['pending', 'new'],
    recent:  ['in_progress', 'processing', 'recent'],
    saved:   ['completed', 'saved', 'done'],
};

const STATUS_LABEL: Record<string, string> = {
    pending:     'معلق',
    new:         'جديد',
    in_progress: 'جارٍ',
    processing:  'جارٍ',
    completed:   'مكتمل',
    done:        'مكتمل',
    active:      'نشطة',
    inactive:    'ملغاة',
    cancelled:   'ملغاة',
};

const STATUS_COLOR: Record<string, string> = {
    active:      '#10B981',
    pending:     '#F59E0B',
    new:         '#3B82F6',
    in_progress: '#8B5CF6',
    processing:  '#8B5CF6',
    completed:   '#10B981',
    done:        '#10B981',
    inactive:    '#9CA3AF',
    cancelled:   '#EF4444',
};

export default function OrdersScreen() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        }
    }, [isAuthenticated, authLoading]);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await apiService.getUserOrders();
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Fetch orders error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchOrders();
    }, [isAuthenticated, fetchOrders]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const tabs = [
        { id: 'saved',  label: 'محفوظ'  },
        { id: 'recent', label: 'حديث'   },
        { id: 'new',    label: 'جديد'   },
        { id: 'all',    label: 'الكل'   },
    ];

    const filteredOrders = activeTab === 'all'
        ? orders
        : orders.filter(o => {
            const s = String(o.status ?? '').toLowerCase();
            return STATUS_MAP[activeTab].includes(s);
        });

    const renderOrderItem = ({ item }: { item: Order }) => {
        const rawStatus = String(item.status ?? 'active').toLowerCase();
        const label     = STATUS_LABEL[rawStatus]  ?? item.status ?? '—';
        const color     = STATUS_COLOR[rawStatus]  ?? '#9CA3AF';

        // Resolve service image from nested data if available
        const imageUri = (item as any).service?.image
            ? { uri: (item as any).service.image }
            : require('@/assets/mirroimagewomen.png');

        const price   = (item as any).service?.price
            ?? (item as any).price
            ?? '—';

        const title   = (item as any).service?.title
            ?? (item as any).title
            ?? `طلب رقم ${item.id}`;

        const desc    = (item as any).stylist?.name
            ?? (item as any).description
            ?? 'تفاصيل الطلب';

        return (
            <TouchableOpacity
                style={styles.orderItem}
                onPress={() => router.push(`/pages/order_details?id=${item.id}` as any)}
                activeOpacity={0.8}
            >
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: color }]}>
                    <Text style={styles.statusText}>{label}</Text>
                </View>

                {/* Content */}
                <View style={styles.orderContent}>
                    <Text style={styles.orderTitle} numberOfLines={1}>{title}</Text>
                    <Text style={styles.orderDescription} numberOfLines={1}>{desc}</Text>
                    <Text style={styles.orderPrice}>{price} ريال</Text>
                </View>

                {/* Image */}
                <Image source={imageUri} style={styles.orderImage} />
            </TouchableOpacity>
        );
    };

    if (authLoading) return null;
    if (!isAuthenticated) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/pages/notifications' as any)}>
                    <Ionicons name="notifications-outline" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>الطلبات</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id)}
                        style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                    >
                        <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#064E3B" />
                </View>
            ) : filteredOrders.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="receipt-outline" size={64} color="#DDD" />
                    <Text style={styles.emptyText}>لا توجد طلبات</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => String(item.id)}
                    showsVerticalScrollIndicator={false}
                    style={styles.ordersList}
                    contentContainerStyle={styles.ordersListContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#064E3B"
                        />
                    }
                />
            )}

            <BottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    tabsContainer: {
        flexDirection: 'row-reverse',
        backgroundColor: '#FFF',
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#064E3B',
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#9CA3AF',
    },
    tabTextActive: {
        color: '#064E3B',
    },
    ordersList: {
        flex: 1,
    },
    ordersListContent: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingBottom: 100,
    },
    orderItem: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 15,
        marginVertical: 6,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        gap: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'center',
    },
    statusText: {
        color: '#FFF',
        fontSize: 11,
        fontFamily: 'Cairo_700Bold',
    },
    orderContent: {
        flex: 1,
        alignItems: 'flex-end',
    },
    orderTitle: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#111827',
        marginBottom: 3,
        textAlign: 'right',
    },
    orderDescription: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        marginBottom: 5,
        textAlign: 'right',
    },
    orderPrice: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    orderImage: {
        width: 58,
        height: 58,
        borderRadius: 12,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Cairo_400Regular',
        color: '#9CA3AF',
        marginTop: 12,
    },
});
