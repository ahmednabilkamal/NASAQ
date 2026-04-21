import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Animated,
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import { rtlText, rtlWritingMode } from '@/config/rtlText';
import { useRouter } from 'expo-router';
import { useAuth } from '@/config/authContext';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import BottomNav from '@/components/BottomNav';
import { isStylistUser, isStylistVerified } from '@/config/navigationFlow';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import apiService, { Order } from '@/config/apiService';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, Shadows } from '@/utils/spacing';
import { FontSizes } from '@/utils/typography';
import { format, isValid, parseISO } from 'date-fns';
import { ar as arLocale, enUS } from 'date-fns/locale';
import { getForwardChevron } from '@/config/directionalIcons';
import { LinearGradient } from 'expo-linear-gradient';
import SarPriceText from '@/components/SarPriceText';
import { pickResolvedEntityImageUrl, resolveMediaUrl } from '@/utils/resolveMediaUrl';
import {
    StylistScreenHeader,
    STYLIST_GREEN,
    STYLIST_GREEN_MUTED,
} from '@/components/StylistScreenHeader';
import {
    orderStatusLabelAr,
    paymentStatusLabelAr,
    stylistOrderServiceTitle,
} from '@/utils/orderDisplay';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

function AnimatedOrderCard({
    index,
    children,
}: {
    index: number;
    children: React.ReactNode;
}) {
    const anim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        anim.setValue(0);
        Animated.timing(anim, {
            toValue: 1,
            duration: 280,
            delay: Math.min(index, 10) * 45,
            useNativeDriver: true,
        }).start();
    }, [anim, index]);

    return (
        <AnimatedView
            style={{
                opacity: anim,
                transform: [
                    {
                        translateY: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [14, 0],
                        }),
                    },
                ],
            }}
        >
            {children}
        </AnimatedView>
    );
}

/** Match stylist orders list pill colors */
const STATUS_COLORS: Record<string, string> = {
    pending: '#F59E0B',
    new: '#3B82F6',
    in_progress: '#2563EB',
    processing: '#2563EB',
    recent: '#2563EB',
    completed: '#059669',
    done: '#059669',
    saved: '#059669',
    cancelled: '#EF4444',
    inactive: '#9CA3AF',
};

const STATUS_MAP: Record<string, string[]> = {
    all: [],
    new: ['pending', 'new'],
    recent: ['in_progress', 'processing', 'recent'],
    saved: ['completed', 'saved', 'done'],
};

function formatOrderDate(raw: string | undefined, languageCode: string): string | null {
    if (!raw) return null;
    try {
        const d = parseISO(raw);
        if (!isValid(d)) return null;
        const loc = languageCode === 'ar' ? arLocale : enUS;
        return format(d, languageCode === 'ar' ? 'd MMM yyyy' : 'MMM d, yyyy', {
            locale: loc,
        });
    } catch {
        return null;
    }
}

export default function OrdersScreen() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { languageCode } = useLanguage();
    const content = (pageData as any)[languageCode] || (pageData as any)['en'];
    const [activeTab, setActiveTab] = useState('all');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const sectionAnims = React.useRef([new Animated.Value(0), new Animated.Value(0)]).current;

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        } else if (!authLoading && isAuthenticated && isStylistUser(user)) {
            router.replace(
                (isStylistVerified(user) ? ROUTES.stylist.home : ROUTES.stylist.pendingVerification) as any
            );
        }
    }, [isAuthenticated, authLoading, user]);

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

    useEffect(() => {
        if (loading) return;
        sectionAnims.forEach((anim) => anim.setValue(0));
        Animated.stagger(
            100,
            sectionAnims.map((anim) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            )
        ).start();
    }, [loading, sectionAnims]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, [fetchOrders]);

    const tabs = useMemo(
        () => [
            { id: 'all', label: content.orders?.tabs?.all },
            { id: 'new', label: content.orders?.tabs?.new },
            { id: 'recent', label: content.orders?.tabs?.recent },
            { id: 'saved', label: content.orders?.tabs?.saved },
        ],
        [content.orders?.tabs]
    );

    const tabCounts = useMemo(() => {
        const c = { all: orders.length, new: 0, recent: 0, saved: 0 };
        for (const o of orders) {
            const s = String(o.status ?? '').toLowerCase();
            if (STATUS_MAP.new.includes(s)) c.new += 1;
            if (STATUS_MAP.recent.includes(s)) c.recent += 1;
            if (STATUS_MAP.saved.includes(s)) c.saved += 1;
        }
        return c;
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (activeTab === 'all') return orders;
        return orders.filter((o) => {
            const s = String(o.status ?? '').toLowerCase();
            return STATUS_MAP[activeTab].includes(s);
        });
    }, [orders, activeTab]);

    const getStatusColor = useCallback(
        (status?: string) => STATUS_COLORS[String(status || '').toLowerCase()] || '#9CA3AF',
        []
    );

    const renderOrderItem = useCallback(
        ({ item, index }: { item: Order; index: number }) => {
            const rec = item as Record<string, unknown>;
            const rawStatus = String(item.status ?? '').toLowerCase();
            const statusKey = rawStatus as keyof typeof content.orders.status;
            const statusLabel =
                languageCode === 'ar'
                    ? orderStatusLabelAr(item.status)
                    : (content.orders?.status?.[statusKey] ?? item.status ?? '—');

            const statusColor = getStatusColor(item.status);
            const pay = String(rec.payment_status || '').toLowerCase();
            const payLabel = paymentStatusLabelAr(rec.payment_status as string | undefined);

            const serviceImage = resolveMediaUrl((item as any).service?.image as string | undefined);
            const stylistImage = pickResolvedEntityImageUrl((item as any).stylist as Record<string, unknown>);
            const avatarUri = serviceImage ?? stylistImage;

            const price =
                (item as any).service?.price ?? (item as any).price ?? (item as any).total;
            const moneyRaw = rec.total ?? price;
            const moneyNum = parseFloat(String(moneyRaw ?? '').replace(/,/g, ''));
            const showMoney = Number.isFinite(moneyNum);

            const created =
                typeof rec.created_at === 'string'
                    ? rec.created_at
                    : typeof rec.createdAt === 'string'
                      ? rec.createdAt
                      : undefined;
            const dateLine = formatOrderDate(
                typeof created === 'string' ? created : undefined,
                languageCode
            );

            const stylistName =
                ((item as any).stylist?.name as string) ||
                (rec.stylist_name as string) ||
                (languageCode === 'ar' ? 'المنسّق' : 'Stylist');

            return (
                <AnimatedOrderCard index={index}>
                    <AnimatedTouchableOpacity
                        style={styles.orderCard}
                        activeOpacity={0.85}
                        onPress={() => router.push(`/pages/order_details?id=${item.id}` as any)}
                    >
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatar} />
                        ) : (
                            <LinearGradient colors={['#F0FDF4', '#ECFDF5']} style={styles.avatarPlaceholder}>
                                <Ionicons name="bag-handle-outline" size={scale(22)} color={STYLIST_GREEN} />
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
                                        {statusLabel}
                                    </Text>
                                </View>
                            </View>

                            <Text style={[styles.orderMeta, rtlText.alignStart]} numberOfLines={1}>
                                {content.orders?.orderNumber ?? '#'}
                                {item.id}
                                {dateLine ? ` · ${dateLine}` : ''}
                            </Text>

                            <View style={styles.stylistRow}>
                                <Ionicons name="person-circle-outline" size={16} color="#94A3B8" />
                                <Text style={[styles.stylistName, rtlText.alignStart]} numberOfLines={1}>
                                    {stylistName}
                                </Text>
                            </View>

                            {pay === 'pending' ? (
                                <Text style={[styles.paymentHint, rtlText.alignStart]}>{payLabel}</Text>
                            ) : pay ? (
                                <Text style={[styles.paymentOk, rtlText.alignStart]}>{payLabel}</Text>
                            ) : null}

                            {showMoney ? (
                                <View style={styles.footerRow}>
                                    <Text style={[styles.totalLabel, rtlText.alignStart]}>
                                        {languageCode === 'ar' ? 'المبلغ' : 'Amount'}
                                    </Text>
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
                    </AnimatedTouchableOpacity>
                </AnimatedOrderCard>
            );
        },
        [content, languageCode, router, getStatusColor]
    );

    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={STYLIST_GREEN} />
            </View>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <SafeAreaView style={[styles.container, userScreenDirection]} edges={['top']}>
            <StylistScreenHeader
                title={content.orders?.title ?? 'الطلبات'}
                showBack={false}
                rightAccessory={
                    <TouchableOpacity
                        onPress={() => router.push('/pages/notifications' as any)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Ionicons name="notifications-outline" size={24} color={STYLIST_GREEN} />
                    </TouchableOpacity>
                }
            >
                <AnimatedView
                    style={{
                        opacity: sectionAnims[0],
                        transform: [
                            {
                                translateY: sectionAnims[0].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [12, 0],
                                }),
                            },
                        ],
                    }}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsScroll}
                    >
                        {tabs.map((tab) => {
                            const active = activeTab === tab.id;
                            const count = tabCounts[tab.id as keyof typeof tabCounts];
                            return (
                                <TouchableOpacity
                                    key={tab.id}
                                    style={[styles.tabChip, active && styles.tabChipActive]}
                                    onPress={() => setActiveTab(tab.id)}
                                    activeOpacity={0.85}
                                >
                                    <Text
                                        style={[
                                            styles.tabChipText,
                                            active && styles.tabChipTextActive,
                                            rtlWritingMode,
                                        ]}
                                    >
                                        {tab.label}
                                    </Text>
                                    <View style={[styles.tabCount, active && styles.tabCountActive]}>
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
                </AnimatedView>
            </StylistScreenHeader>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={STYLIST_GREEN} />
                </View>
            ) : (
                <AnimatedView
                    style={{
                        flex: 1,
                        opacity: sectionAnims[1],
                        transform: [
                            {
                                translateY: sectionAnims[1].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [16, 0],
                                }),
                            },
                        ],
                    }}
                >
                    <FlatList
                        data={filteredOrders}
                        renderItem={renderOrderItem}
                        keyExtractor={(item) => String(item.id)}
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={styles.cardGap} />}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={STYLIST_GREEN} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyWrap}>
                                <View style={styles.emptyIconCircle}>
                                    <Ionicons name="receipt-outline" size={scale(44)} color={STYLIST_GREEN} />
                                </View>
                                <Text style={[styles.emptyTitle, rtlWritingMode]}>
                                    {content.orders?.noOrders || content.common?.noResults}
                                </Text>
                                <Text style={[styles.emptySubtitle, rtlWritingMode]}>
                                    {content.orders?.emptySubtitle}
                                </Text>
                            </View>
                        }
                    />
                </AnimatedView>
            )}

            <BottomNav />
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
        flexGrow: 1,
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
    stylistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: Spacing.verticalXs,
    },
    stylistName: {
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
