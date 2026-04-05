import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import { useAuth } from '@/config/authContext';
import {
    loadNotificationHistory,
    markAllNotificationsRead,
    markNotificationRead,
    type NotificationHistoryItem,
} from '@/services/push/notificationHistory';
import { parseNotificationData } from '@/services/push/notificationPayload';
import { getHrefFromNotificationPayload } from '@/services/push/navigationFromNotification';
import { format, isToday, isYesterday } from 'date-fns';
import { ar } from 'date-fns/locale';

type RowType = 'message' | 'order' | 'ticket' | 'system';

function rowTypeFromParsed(parsed: ReturnType<typeof parseNotificationData>): RowType {
    if (!parsed) return 'system';
    if (parsed.type === 'message') return 'message';
    if (parsed.type === 'ticket') return 'ticket';
    return 'order';
}

function formatNotifTime(iso: string): string {
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '';
        if (isToday(d)) {
            return `اليوم | ${format(d, 'hh:mm a', { locale: ar })}`;
        }
        if (isYesterday(d)) {
            return `أمس | ${format(d, 'hh:mm a', { locale: ar })}`;
        }
        return format(d, 'EEE d MMM | hh:mm a', { locale: ar });
    } catch {
        return '';
    }
}

const TYPE_CONFIG: Record<RowType, { icon: string; bg: string; color: string }> = {
    message: { icon: 'chatbubble-ellipses', bg: '#E8F5E9', color: '#064E3B' },
    order: { icon: 'receipt-outline', bg: '#EDE9FE', color: '#7C3AED' },
    ticket: { icon: 'help-buoy-outline', bg: '#E0F2FE', color: '#0369A1' },
    system: { icon: 'notifications-outline', bg: '#F3F4F6', color: '#6B7280' },
};

export default function NotificationsScreen() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const reload = useCallback(async () => {
        const list = await loadNotificationHistory();
        setNotifications(list);
    }, []);

    useFocusEffect(
        useCallback(() => {
            void reload();
        }, [reload])
    );

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = async () => {
        await markAllNotificationsRead();
        await reload();
    };

    const onPressItem = async (item: NotificationHistoryItem) => {
        await markNotificationRead(item.id);
        await reload();

        const parsed = item.data ? parseNotificationData(item.data) : null;
        if (!parsed) {
            return;
        }

        if (!isAuthenticated) {
            Alert.alert('تسجيل الدخول', 'سجّل الدخول لفتح المحادثة أو تفاصيل الطلب.', [
                { text: 'حسناً', style: 'cancel' },
                { text: 'تسجيل الدخول', onPress: () => router.push('/pages/login' as any) },
            ]);
            return;
        }

        const href = getHrefFromNotificationPayload(parsed);
        router.push(href);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await reload();
        setRefreshing(false);
    };

    const renderItem = ({ item }: { item: NotificationHistoryItem }) => {
        const parsed = item.data ? parseNotificationData(item.data) : null;
        const rowType = rowTypeFromParsed(parsed);
        const cfg = TYPE_CONFIG[rowType];
        const navigable = parsed != null;

        return (
            <TouchableOpacity
                style={[styles.card, !item.read && styles.cardUnread]}
                onPress={() => void onPressItem(item)}
                activeOpacity={0.85}
            >
                {!item.read && <View style={styles.unreadDot} />}

                <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
                </View>

                <View style={styles.textBlock}>
                    <Text style={[styles.title, !item.read && styles.titleBold]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    {item.body ? (
                        <Text style={styles.body} numberOfLines={2}>
                            {item.body}
                        </Text>
                    ) : null}
                    <Text style={styles.time}>{formatNotifTime(item.createdAt)}</Text>
                </View>

                {navigable ? (
                    <Ionicons name="chevron-back" size={20} color="#9CA3AF" style={styles.chevron} />
                ) : null}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, userScreenDirection]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name={getBackChevron()} size={24} color="#000" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    الإشعارات
                    {unreadCount > 0 ? <Text style={styles.badge}> ({unreadCount})</Text> : null}
                </Text>

                <TouchableOpacity
                    onPress={() => void markAllRead()}
                    style={styles.headerBtn}
                    disabled={notifications.length === 0}
                >
                    <Ionicons
                        name="checkmark-done-outline"
                        size={22}
                        color={notifications.length === 0 ? '#CCC' : '#064E3B'}
                    />
                </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="notifications-off-outline" size={64} color="#DDD" />
                    <Text style={styles.emptyText}>لا توجد إشعارات بعد</Text>
                    <Text style={styles.emptyHint}>
                        ستظهر هنا رسائل الطلبات والمحادثات عند وصولها إلى جهازك.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(it) => it.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#064E3B" />
                    }
                />
            )}
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
    headerTitle: { fontSize: 18, fontFamily: 'Cairo_700Bold', color: '#000', ...rtlText.alignStart },
    badge: { fontSize: 15, color: '#064E3B', fontFamily: 'Cairo_700Bold' },
    list: { padding: 16, paddingBottom: 32 },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        gap: 12,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    cardUnread: {
        backgroundColor: '#F7FAF9',
        borderLeftWidth: 3,
        borderLeftColor: '#064E3B',
    },
    unreadDot: {
        position: 'absolute',
        top: 12,
        left: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#064E3B',
    },
    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    textBlock: { flex: 1, alignItems: 'flex-start', minWidth: 0 },
    title: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#374151',
        ...rtlText.alignStart,
        marginBottom: 3,
        lineHeight: 22,
    },
    titleBold: { fontFamily: 'Cairo_700Bold', color: '#111' },
    body: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        ...rtlText.alignStart,
        marginBottom: 5,
    },
    time: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#9CA3AF',
        ...rtlText.alignStart,
    },
    chevron: { flexShrink: 0, opacity: 0.85 },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 32,
    },
    emptyText: { fontSize: 16, fontFamily: 'Cairo_700Bold', color: '#6B7280', ...rtlText.alignStart },
    emptyHint: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
    },
});
