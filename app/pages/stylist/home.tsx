import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/config/authContext';
import { isStylistUser, isStylistVerified } from '@/config/navigationFlow';
import { ROUTES } from '@/constants/routes';
import { getForwardChevron } from '@/config/directionalIcons';
import { stylistScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { apiService, Order } from '@/config/apiService';
import StylistBottomNav from '@/components/StylistBottomNav';
import {
    StylistScreenHeader,
    STYLIST_GREEN,
} from '@/components/StylistScreenHeader';
import SarPriceText from '@/components/SarPriceText';
import { resolveUserProfileAvatarUrl } from '@/utils/userProfileAvatar';

interface DashboardStats {
    newOrders: number;
    completedOrders: number;
    earnings: number;
    averageRating: number;
}

export default function StylistHomeScreen() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        newOrders: 0,
        completedOrders: 0,
        earnings: 0,
        averageRating: 0,
    });
    const [todayOrders, setTodayOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    /** Dedupes overlapping dashboard loads (Strict Mode double-mount, rapid re-renders). */
    const dashboardFetchRef = useRef<Promise<void> | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        } else if (!authLoading && isAuthenticated && !isStylistUser(user)) {
            // Prevent any stylist API calls while redirecting clients away.
            setLoading(false);
            setRefreshing(false);
            router.replace('/pages/tabs/homescreen' as any);
        } else if (
            !authLoading &&
            isAuthenticated &&
            isStylistUser(user) &&
            !isStylistVerified(user)
        ) {
            router.replace(ROUTES.stylist.pendingVerification as any);
        }
    }, [isAuthenticated, authLoading, user, router]);

    const fetchDashboardData = useCallback(async () => {
        // Guard: never call stylist endpoints for non-stylist users (can happen during fast transitions).
        if (!isAuthenticated || !isStylistUser(user)) {
            setLoading(false);
            setRefreshing(false);
            return;
        }
        if (dashboardFetchRef.current) {
            return dashboardFetchRef.current;
        }
        const run = (async () => {
            try {
                const [ordersRes, profileRes] = await Promise.allSettled([
                    apiService.getStylistOrders({ per_page: 50 }),
                    apiService.getStylistProfile(),
                ]);

                let allOrders: Order[] = [];
                if (ordersRes.status === 'fulfilled') {
                    const data = ordersRes.value?.data;
                    allOrders = Array.isArray(data) ? data : [];
                }

                const newOrders = allOrders.filter((o) => {
                    const st = String(o.status || '').toLowerCase();
                    return st === 'new';
                }).length;
                const completedOrders = allOrders.filter(
                    (o) => o.status === 'completed' || o.status === 'done'
                ).length;

                let rating = 0;
                let earnings = 0;
                if (profileRes.status === 'fulfilled') {
                    const profile = profileRes.value?.data;
                    rating = parseFloat(String(profile?.rating ?? profile?.average_rating ?? 0));
                    earnings = parseFloat(String(profile?.total_earnings ?? profile?.earnings ?? 0));
                }

                if (earnings === 0 && completedOrders > 0) {
                    earnings = allOrders
                        .filter((o) => o.status === 'completed' || o.status === 'done')
                        .reduce((sum, o) => sum + parseFloat(String(o.total ?? o.price ?? 0)), 0);
                }

                setStats({
                    newOrders,
                    completedOrders,
                    earnings,
                    averageRating: rating,
                });

                const today = new Date().toISOString().split('T')[0];
                const todayFiltered = allOrders.filter((o) => {
                    const orderDate = (o.created_at || o.date || '').split('T')[0];
                    return orderDate === today;
                });
                setTodayOrders(todayFiltered.length > 0 ? todayFiltered : allOrders.slice(0, 3));
            } catch (error) {
                console.error('Stylist dashboard fetch error:', error);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        })();
        dashboardFetchRef.current = run;
        run.finally(() => {
            if (dashboardFetchRef.current === run) {
                dashboardFetchRef.current = null;
            }
        });
        return run;
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (isAuthenticated && isStylistUser(user)) fetchDashboardData();
    }, [isAuthenticated, user, fetchDashboardData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={STYLIST_GREEN} />
            </View>
        );
    }

    if (!isAuthenticated) return null;

    const stylistHomeAvatarUri = resolveUserProfileAvatarUrl(user as Record<string, unknown> | null);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'صباح الأناقة';
        if (hour < 18) return 'مساء الأناقة';
        return 'مساء الأناقة';
    };

    const formatOrderDate = (order: Order) => {
        const dateStr = order.created_at || order.date;
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${months[d.getMonth()]}\n${d.getDate()}`;
    };

    const formatOrderTime = (order: Order) => {
        const dateStr = order.created_at || order.date;
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const hours = d.getHours();
        const mins = d.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'م' : 'ص';
        const h = hours % 12 || 12;
        return `${h}:${mins} ${ampm}`;
    };

    return (
        <SafeAreaView style={[styles.container, stylistScreenDirection]} edges={['top']}>
            <StylistScreenHeader
                homeLeading={
                    <View style={styles.headerRight}>
                        <View style={styles.avatarContainer}>
                            {stylistHomeAvatarUri ? (
                                <Image source={{ uri: stylistHomeAvatarUri }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={20} color={STYLIST_GREEN} />
                                </View>
                            )}
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.greeting}>{getGreeting()}</Text>
                            <Text style={styles.userName}>{user?.name || 'نور حسن'}</Text>
                        </View>
                    </View>
                }
                rightAccessory={
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => router.push('/pages/notifications' as any)}
                    >
                        <Ionicons name="notifications-outline" size={22} color={STYLIST_GREEN} />
                    </TouchableOpacity>
                }
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={STYLIST_GREEN} />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={STYLIST_GREEN} />
                    }
                >
                    {/* Overview Section */}
                    <Text style={styles.sectionTitle}>نظرة عامة</Text>

                    <View style={styles.statsGrid}>
                        {/* New Orders */}
                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <View style={styles.statIconContainer}>
                                    <Ionicons name="clipboard-outline" size={16} color="#064E3B" />
                                </View>
                                <View style={styles.statBadge}>
                                    <Text style={styles.statBadgeText}>جديد</Text>
                                </View>
                            </View>
                            <Text style={styles.statValue}>{stats.newOrders}</Text>
                            <Text style={styles.statLabel}>طلبات جديدة اليوم</Text>
                        </View>

                        {/* Completed Orders */}
                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <View style={styles.statIconContainer}>
                                    <Ionicons name="clipboard-outline" size={16} color="#064E3B" />
                                </View>
                                <View style={[styles.statBadge, styles.statBadgeGreen]}>
                                    <Text style={[styles.statBadgeText, styles.statBadgeTextGreen]}>مكتمل</Text>
                                </View>
                            </View>
                            <Text style={styles.statValue}>{stats.completedOrders}</Text>
                            <Text style={styles.statLabel}>طلبات مكتملة</Text>
                        </View>

                        {/* Earnings */}
                        <TouchableOpacity
                            style={styles.statCard}
                            activeOpacity={0.7}
                            onPress={() => router.push('/pages/stylist/earnings' as any)}
                        >
                            <View style={styles.statHeader}>
                                <View style={styles.statIconContainer}>
                                    <Ionicons name="cash-outline" size={16} color="#064E3B" />
                                </View>
                                <View style={[styles.statBadge, styles.statBadgeBlue]}>
                                    <Text style={[styles.statBadgeText, styles.statBadgeTextBlue]}>الأرباح</Text>
                                </View>
                            </View>
                            <SarPriceText value={stats.earnings} textStyle={styles.statValue} />
                            <View style={styles.statSubRow}>
                                <Ionicons name="trending-up-outline" size={14} color="#10B981" />
                                <Text style={styles.statLabel}>هذا الشهر</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Average Rating */}
                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <Ionicons name="star" size={16} color="#F59E0B" />
                                <View style={[styles.statBadge, styles.statBadgeYellow]}>
                                    <Text style={[styles.statBadgeText, styles.statBadgeTextYellow]}>التقييمات</Text>
                                </View>
                            </View>
                            <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
                            <Text style={styles.statLabel}>متوسط التقييم</Text>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>إجراءات سريعة</Text>

                    <TouchableOpacity
                        style={styles.quickActionPrimary}
                        activeOpacity={0.8}
                        onPress={() => router.push('/pages/stylist/services' as any)}
                    >
                        <View style={styles.quickActionPrimaryIcon}>
                            <Ionicons name="add-circle" size={26} color="#FFF" />
                        </View>
                        <Text style={styles.quickActionPrimaryText}>اضافة خدمة جديدة</Text>
                        <Ionicons name={getForwardChevron()} size={20} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionSecondary}
                        activeOpacity={0.7}
                        onPress={() => router.push('/pages/stylist/orders' as any)}
                    >
                        <View style={styles.quickActionSecondaryIcon}>
                            <Ionicons name="clipboard-outline" size={18} color="#064E3B" />
                        </View>
                        <Text style={styles.quickActionSecondaryText}>الطلبات الجديدة</Text>
                        <Ionicons name={getForwardChevron()} size={18} color="#666" />
                    </TouchableOpacity>

                    {/* Today's Orders */}
                    <Text style={styles.sectionTitle}>طلبات اليوم</Text>

                    {todayOrders.length === 0 ? (
                        <View style={styles.emptyOrders}>
                            <Ionicons name="calendar-outline" size={36} color="#CCC" />
                            <Text style={styles.emptyOrdersText}>لا توجد طلبات اليوم</Text>
                        </View>
                    ) : (
                        todayOrders.map((order) => (
                            <TouchableOpacity
                                key={String(order.id)}
                                style={styles.orderCard}
                                activeOpacity={0.7}
                                onPress={() =>
                                    router.push(`/pages/order_details?id=${order.id}` as any)
                                }
                            >
                                <View style={styles.orderDateBadge}>
                                    <Text style={styles.orderDateText}>
                                        {formatOrderDate(order)}
                                    </Text>
                                </View>

                                <View style={styles.orderInfo}>
                                    <Text style={styles.orderTitle}>
                                        {order.service_name || order.title || 'طقم كامل'}
                                    </Text>
                                    <Text style={styles.orderSub}>
                                        {order.client_name || order.user?.name || 'عميل'} - {formatOrderTime(order)}
                                    </Text>
                                </View>

                                <Ionicons name={getForwardChevron()} size={18} color="#999" />
                            </TouchableOpacity>
                        ))
                    )}

                    {/* Bottom spacer for nav */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}

            <StylistBottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userInfo: {
        alignItems: 'flex-start',
        marginStart: 12,
    },
    greeting: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        marginBottom: -2,
        ...rtlText.alignStart,
    },
    userName: {
        fontSize: 17,
        fontFamily: 'Cairo_700Bold',
        color: '#0F172A',
        ...rtlText.alignStart,
    },
    avatarContainer: {
        width: 46,
        height: 46,
        borderRadius: 23,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#F0F0F0',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(6, 78, 59, 0.12)',
    },

    // Section
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        marginTop: 24,
        marginBottom: 14,
        ...rtlText.alignStart,
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 14,
        width: '48%',
        flexGrow: 1,
        minHeight: 120,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statBadge: {
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    statBadgeText: {
        fontSize: 11,
        fontFamily: 'Cairo_700Bold',
        color: '#3B82F6',
    },
    statBadgeGreen: {
        backgroundColor: '#F0FDF4',
    },
    statBadgeTextGreen: {
        color: '#10B981',
    },
    statBadgeBlue: {
        backgroundColor: '#EFF6FF',
    },
    statBadgeTextBlue: {
        color: '#3B82F6',
    },
    statBadgeYellow: {
        backgroundColor: '#FFFBEB',
    },
    statBadgeTextYellow: {
        color: '#F59E0B',
    },
    statValue: {
        fontSize: 28,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        ...rtlText.alignStart,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        ...rtlText.alignStart,
    },
    statSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 4,
    },

    // Quick Actions
    quickActionPrimary: {
        backgroundColor: '#064E3B',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    quickActionPrimaryText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#FFF',
        flex: 1,
        ...rtlText.alignStart,
    },
    quickActionPrimaryIcon: {
    },
    quickActionSecondary: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    quickActionSecondaryText: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        flex: 1,
        ...rtlText.alignStart,
    },
    quickActionSecondaryIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Today's Orders
    emptyOrders: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        gap: 8,
    },
    emptyOrdersText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        ...rtlText.alignStart,
    },
    orderCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    orderInfo: {
        flex: 1,
        alignItems: 'flex-start',
        marginHorizontal: 12,
    },
    orderTitle: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        ...rtlText.alignStart,
    },
    orderSub: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        marginTop: 2,
        ...rtlText.alignStart,
    },
    orderDateBadge: {
        backgroundColor: '#F0FDF4',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
        minWidth: 52,
    },
    orderDateText: {
        fontSize: 12,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
        lineHeight: 18,
    },
});
