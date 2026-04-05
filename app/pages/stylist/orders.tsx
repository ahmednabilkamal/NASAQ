import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Image,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/config/authContext';
import { isStylistUser, isStylistVerified } from '@/config/navigationFlow';
import { ROUTES } from '@/constants/routes';
import { getForwardChevron } from '@/config/directionalIcons';
import {
    StylistScreenHeader,
    STYLIST_GREEN,
    STYLIST_GREEN_MUTED,
} from '@/components/StylistScreenHeader';
import apiService, { Order } from '@/config/apiService';
import StylistBottomNav from '@/components/StylistBottomNav';
import { stylistScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import {
    orderStatusLabelAr,
    paymentStatusLabelAr,
    stylistOrderServiceTitle,
} from '@/utils/orderDisplay';
import { LinearGradient } from 'expo-linear-gradient';
import SarPriceText from '@/components/SarPriceText';
import { pickResolvedEntityImageUrl } from '@/utils/resolveMediaUrl';
import { format, isValid, parseISO } from 'date-fns';
import { ar as arLocale } from 'date-fns/locale';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, Shadows } from '@/utils/spacing';
import { FontSizes } from '@/utils/typography';

const STATUS_TABS = [
    { key: 'all', label: 'الكل' },
    { key: 'new', label: 'جديدة' },
    { key: 'active', label: 'نشطة' },
    { key: 'completed', label: 'مكتملة' },
] as const;

const STATUS_COLORS: Record<string, string> = {
    pending: '#F59E0B',
    new: '#3B82F6',
    in_progress: '#2563EB',
    processing: '#2563EB',
    completed: '#059669',
    done: '#059669',
    cancelled: '#EF4444',
};

function formatOrderDate(raw?: string): string | null {
    if (!raw) return null;
    try {
        const d = parseISO(raw);
        if (!isValid(d)) return null;
        return format(d, 'd MMM yyyy', { locale: arLocale });
    } catch {
        return null;
    }
}

function orderMatchesTab(o: Order, tab: string): boolean {
    if (tab === 'all') return true;
    const st = String(o.status || '').toLowerCase();
    if (tab === 'new') return st === 'new';
    if (tab === 'active') return st === 'in_progress' || st === 'processing';
    if (tab === 'completed') return st === 'completed' || st === 'done';
    return true;
}

export default function StylistOrdersScreen() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('all');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        } else if (!authLoading && isAuthenticated && !isStylistUser(user)) {
            router.replace('/pages/tabs/homescreen' as any);
        } else if (
            !authLoading &&
            isAuthenticated &&
            isStylistUser(user) &&
            !isStylistVerified(user)
        ) {
            router.replace(ROUTES.stylist.pendingVerification as any);
        }
    }, [isAuthenticated, authLoading, user]);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await apiService.getStylistOrders({ per_page: 50 });
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Stylist orders fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchOrders();
    }, [isAuthenticated, fetchOrders]);

    const tabCounts = useMemo(() => {
        const c: Record<string, number> = { all: orders.length, new: 0, active: 0, completed: 0 };
        for (const o of orders) {
            for (const tab of STATUS_TABS) {
                if (tab.key === 'all') continue;
                if (orderMatchesTab(o, tab.key)) c[tab.key] += 1;
            }
        }
        return c;
    }, [orders]);

    const filteredOrders = useMemo(
        () => orders.filter((o) => orderMatchesTab(o, activeTab)),
        [orders, activeTab]
    );

    const getStatusColor = useCallback(
        (status?: string) => STATUS_COLORS[String(status || '').toLowerCase()] || '#9CA3AF',
        []
    );

    const renderItem = useCallback(
        ({ item }: { item: Order }) => {
            const rec = item as Record<string, unknown>;
            const pay = String(rec.payment_status || '').toLowerCase();
            const payLabel = paymentStatusLabelAr(rec.payment_status as string | undefined);
            const statusColor = getStatusColor(item.status);
            const created =
                typeof rec.created_at === 'string'
                    ? rec.created_at
                    : typeof rec.createdAt === 'string'
                      ? rec.createdAt
                      : undefined;
            const dateLine = formatOrderDate(created);
            const moneyNum = parseFloat(String(rec.total ?? '').replace(/,/g, ''));
            const showMoney = Number.isFinite(moneyNum);
            const userObj = rec.user as { name?: string; image?: string } | undefined;
            const clientName =
                (rec.client_name as string) || userObj?.name || 'عميل';
            const avatarUri = pickResolvedEntityImageUrl(userObj as any);

            return (
                <TouchableOpacity
                    style={styles.orderCard}
                    activeOpacity={0.85}
                    onPress={() =>
                        router.push(`/pages/order_details?id=${item.id}` as any)
                    }
                >
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    ) : (
                        <LinearGradient
                            colors={['#F0FDF4', '#ECFDF5']}
                            style={styles.avatarPlaceholder}
                        >
                            <Ionicons name="person-outline" size={scale(22)} color={STYLIST_GREEN} />
                        </LinearGradient>
                    )}

                    <View style={styles.orderBody}>
                        <View style={styles.orderTopRow}>
                            <Text style={styles.orderTitle} numberOfLines={2}>
                                {stylistOrderServiceTitle(item)}
                            </Text>
                            <View
                                style={[
                                    styles.statusPill,
                                    { backgroundColor: `${statusColor}22` },
                                ]}
                            >
                                <Text
                                    style={[styles.statusText, { color: statusColor }]}
                                    numberOfLines={1}
                                >
                                    {orderStatusLabelAr(item.status)}
                                </Text>
                            </View>
                        </View>

                        <Text style={[styles.orderMeta, rtlText.alignStart]} numberOfLines={1}>
                            طلب #{item.id}
                            {dateLine ? ` · ${dateLine}` : ''}
                        </Text>

                        <View style={styles.clientRow}>
                            <Ionicons name="person-circle-outline" size={16} color="#94A3B8" />
                            <Text style={[styles.clientName, rtlText.alignStart]} numberOfLines={1}>
                                {clientName}
                            </Text>
                        </View>

                        {pay === 'pending' ? (
                            <Text style={[styles.paymentHint, rtlText.alignStart]}>{payLabel}</Text>
                        ) : pay ? (
                            <Text style={[styles.paymentOk, rtlText.alignStart]}>{payLabel}</Text>
                        ) : null}

                        {showMoney ? (
                            <View style={styles.footerRow}>
                                <Text style={[styles.totalLabel, rtlText.alignStart]}>المبلغ</Text>
                                <SarPriceText value={moneyNum} textStyle={styles.totalValue} />
                            </View>
                        ) : null}
                    </View>

                    <Ionicons
                        name={getForwardChevron()}
                        size={20}
                        color="#9CA3AF"
                        style={styles.chevron}
                    />
                </TouchableOpacity>
            );
        },
        [getStatusColor, router]
    );

    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={STYLIST_GREEN} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, stylistScreenDirection]} edges={['top']}>
            <StylistScreenHeader title="الطلبات">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsScroll}
                >
                    {STATUS_TABS.map((tab) => {
                        const active = activeTab === tab.key;
                        const count = tabCounts[tab.key] ?? 0;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                style={[styles.tabChip, active && styles.tabChipActive]}
                                onPress={() => setActiveTab(tab.key)}
                                activeOpacity={0.85}
                            >
                                <Text
                                    style={[
                                        styles.tabChipText,
                                        active && styles.tabChipTextActive,
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                                <View
                                    style={[styles.tabCount, active && styles.tabCountActive]}
                                >
                                    <Text
                                        style={[
                                            styles.tabCountText,
                                            active && styles.tabCountTextActive,
                                        ]}
                                    >
                                        {count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </StylistScreenHeader>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={STYLIST_GREEN} />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => String(item.id)}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={styles.cardGap} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchOrders();
                            }}
                            tintColor={STYLIST_GREEN}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons
                                    name="receipt-outline"
                                    size={scale(44)}
                                    color={STYLIST_GREEN}
                                />
                            </View>
                            <Text style={styles.emptyTitle}>لا توجد طلبات</Text>
                            <Text style={styles.emptySubtitle}>
                                ستظهر طلبات العملاء هنا عند وصولها.
                            </Text>
                        </View>
                    }
                    renderItem={renderItem}
                />
            )}

            <StylistBottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabsScroll: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingBottom: Spacing.verticalSm,
        gap: Spacing.sm,
    },
    tabChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: scaleVertical(10),
        paddingHorizontal: scale(14),
        borderRadius: BorderRadius.button,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderWidth: 1,
        borderColor: 'rgba(6, 78, 59, 0.12)',
    },
    tabChipActive: {
        backgroundColor: STYLIST_GREEN,
        borderColor: STYLIST_GREEN,
    },
    tabChipText: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_600SemiBold',
        color: '#475569',
        ...rtlText.alignStart,
    },
    tabChipTextActive: {
        color: '#FFF',
    },
    tabCount: {
        marginStart: Spacing.sm,
        minWidth: scale(22),
        height: scale(22),
        borderRadius: scale(11),
        backgroundColor: 'rgba(15, 23, 42, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: scale(6),
    },
    tabCountActive: {
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    tabCountText: {
        fontSize: scale(11),
        fontFamily: 'Cairo_700Bold',
        color: '#334155',
    },
    tabCountTextActive: {
        color: '#FFF',
    },
    list: { flex: 1 },
    listContent: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingTop: Spacing.verticalMd,
        paddingBottom: scaleVertical(100),
    },
    cardGap: { height: Spacing.verticalMd },
    orderCard: {
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.card,
        padding: Spacing.cardPadding,
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.06)',
        ...Shadows.medium,
        shadowOpacity: 0.08,
        elevation: 4,
    },
    avatar: {
        width: scale(56),
        height: scale(56),
        borderRadius: BorderRadius.lg,
    },
    avatarPlaceholder: {
        width: scale(56),
        height: scale(56),
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    orderBody: {
        flex: 1,
        minWidth: 0,
        marginStart: Spacing.md,
        justifyContent: 'center',
    },
    orderTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        marginBottom: Spacing.verticalXs,
    },
    orderTitle: {
        flex: 1,
        minWidth: 0,
        fontSize: scale(15),
        fontFamily: 'Cairo_700Bold',
        color: '#0F172A',
        ...rtlText.alignStart,
    },
    statusPill: {
        borderRadius: BorderRadius.badge,
        paddingHorizontal: scale(10),
        paddingVertical: scaleVertical(4),
        flexShrink: 0,
        maxWidth: '40%',
    },
    statusText: {
        fontSize: scale(11),
        fontFamily: 'Cairo_700Bold',
        ...rtlText.alignStart,
    },
    orderMeta: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#94A3B8',
        marginBottom: Spacing.verticalXs,
    },
    clientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: Spacing.verticalXs,
    },
    clientName: {
        flex: 1,
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_600SemiBold',
        color: '#475569',
    },
    paymentHint: {
        fontSize: scale(11),
        fontFamily: 'Cairo_700Bold',
        color: '#D97706',
        marginBottom: Spacing.verticalXs,
    },
    paymentOk: {
        fontSize: scale(11),
        fontFamily: 'Cairo_400Regular',
        color: '#059669',
        marginBottom: Spacing.verticalXs,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.verticalXs,
        paddingTop: Spacing.verticalSm,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E2E8F0',
    },
    totalLabel: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#64748B',
    },
    totalValue: {
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_700Bold',
        color: STYLIST_GREEN,
        writingDirection: 'ltr',
    },
    chevron: {
        alignSelf: 'center',
        marginStart: Spacing.sm,
    },
    emptyWrap: {
        alignItems: 'center',
        paddingTop: scaleVertical(48),
        paddingHorizontal: Spacing.xxl,
    },
    emptyIconCircle: {
        width: scale(100),
        height: scale(100),
        borderRadius: scale(50),
        backgroundColor: STYLIST_GREEN_MUTED,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(6, 78, 59, 0.12)',
    },
    emptyTitle: {
        fontSize: FontSizes.h3,
        fontFamily: 'Cairo_700Bold',
        color: '#334155',
        textAlign: 'center',
    },
    emptySubtitle: {
        marginTop: Spacing.verticalSm,
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: scaleVertical(22),
    },
});
