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
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import BottomNav from '@/components/BottomNav';
import { Ionicons } from '@expo/vector-icons';
import apiService, { Order } from '@/config/apiService';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius } from '@/utils/spacing';
import { FontSizes } from '@/utils/typography';

const STATUS_MAP: Record<string, string[]> = {
    all:     [],
    new:     ['pending', 'new'],
    recent:  ['in_progress', 'processing', 'recent'],
    saved:   ['completed', 'saved', 'done'],
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
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode] || (pageData as any)['en'];
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
        { id: 'saved',  label: content.orders?.tabs?.saved || 'محفوظ'  },
        { id: 'recent', label: content.orders?.tabs?.recent || 'حديث'   },
        { id: 'new',    label: content.orders?.tabs?.new || 'جديد'   },
        { id: 'all',    label: content.orders?.tabs?.all || 'الكل'   },
    ];

    const filteredOrders = activeTab === 'all'
        ? orders
        : orders.filter(o => {
            const s = String(o.status ?? '').toLowerCase();
            return STATUS_MAP[activeTab].includes(s);
        });

    const renderOrderItem = ({ item }: { item: Order }) => {
        const rawStatus = String(item.status ?? 'active').toLowerCase();
        const statusKey = rawStatus as keyof typeof content.orders.status;
        const label     = content.orders?.status?.[statusKey] ?? item.status ?? '—';
        const color     = STATUS_COLOR[rawStatus]  ?? '#9CA3AF';

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

                <View style={styles.orderContent}>
                    <Text style={styles.orderTitle} numberOfLines={1}>{title}</Text>
                    <Text style={styles.orderDescription} numberOfLines={1}>{desc}</Text>
                    <Text style={styles.orderPrice}>{price} {content.common?.currency || 'ريال'}</Text>
                </View>

                <Image source={imageUri} style={styles.orderImage} />
            </TouchableOpacity>
        );
    };

    if (authLoading) return null;
    if (!isAuthenticated) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/pages/notifications' as any)}>
                    <Ionicons name="notifications-outline" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{content.orders?.title || 'الطلبات'}</Text>
                <View style={{ width: 24 }} />
            </View>

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

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#064E3B" />
                </View>
            ) : filteredOrders.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="receipt-outline" size={64} color="#DDD" />
                    <Text style={styles.emptyText}>{content.common?.noResults || 'لا توجد طلبات'}</Text>
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
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingVertical: Spacing.verticalMd,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: FontSizes.h2,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    tabsContainer: {
        flexDirection: 'row-reverse',
        backgroundColor: '#FFF',
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.verticalMd,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#064E3B',
    },
    tabText: {
        fontSize: FontSizes.body,
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
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingVertical: Spacing.verticalMd,
        paddingBottom: scaleVertical(100),
    },
    orderItem: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.lg,
        padding: Spacing.cardPadding,
        marginVertical: Spacing.verticalSm,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        gap: Spacing.gapLg,
    },
    statusBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.verticalXs,
        borderRadius: BorderRadius.sm,
        alignSelf: 'center',
    },
    statusText: {
        color: '#FFF',
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_700Bold',
    },
    orderContent: {
        flex: 1,
        alignItems: 'flex-end',
    },
    orderTitle: {
        fontSize: scale(15),
        fontFamily: 'Cairo_700Bold',
        color: '#111827',
        marginBottom: Spacing.verticalXs,
        textAlign: 'right',
    },
    orderDescription: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        marginBottom: Spacing.verticalXs,
        textAlign: 'right',
    },
    orderPrice: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    orderImage: {
        width: scale(58),
        height: scale(58),
        borderRadius: BorderRadius.md,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_400Regular',
        color: '#9CA3AF',
        marginTop: Spacing.verticalMd,
    },
});
