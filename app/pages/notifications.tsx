import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';

type NotifType = 'message' | 'success' | 'offer' | 'order' | 'system';

interface Notification {
    id: string;
    title: string;
    body?: string;
    time: string;
    type: NotifType;
    read: boolean;
}

// Placeholder data – replace with API when backend has /user/notifications
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'المنسقة سارة أرسلت لك رسالة جديدة',
        body: 'هلا وين أنتِ؟ أرسلت لك الاقتراحات',
        time: 'اليوم | 03:30 م',
        type: 'message',
        read: false,
    },
    {
        id: '2',
        title: 'تم تأكيد باقة التنسيق بنجاح',
        body: 'سيتواصل معكِ المنسق خلال 24 ساعة',
        time: 'الثلاثاء | 04:30 م',
        type: 'success',
        read: false,
    },
    {
        id: '3',
        title: 'عرض خاص على باقات التنسيق',
        body: 'خصم 20% على جميع باقات التنسيق لفترة محدودة',
        time: 'الثلاثاء | 02:00 م',
        type: 'offer',
        read: true,
    },
    {
        id: '4',
        title: 'طلبك رقم #1024 في مرحلة التجهيز',
        body: 'جارٍ تجهيز طلبك من قِبل المنسقة',
        time: 'الاثنين | 11:00 ص',
        type: 'order',
        read: true,
    },
];

const TYPE_CONFIG: Record<NotifType, { icon: string; bg: string; color: string }> = {
    message: { icon: 'chatbubble-ellipses',   bg: '#E8F5E9', color: '#064E3B' },
    success: { icon: 'checkmark-circle',       bg: '#E8F5E9', color: '#10B981' },
    offer:   { icon: 'pricetag',               bg: '#FEF3C7', color: '#D97706' },
    order:   { icon: 'receipt-outline',        bg: '#EDE9FE', color: '#7C3AED' },
    system:  { icon: 'notifications-outline',  bg: '#F3F4F6', color: '#6B7280' },
};

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800); // replace with real fetch
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.system;
        return (
            <TouchableOpacity
                style={[styles.card, !item.read && styles.cardUnread]}
                onPress={() => markRead(item.id)}
                activeOpacity={0.85}
            >
                {/* Unread dot */}
                {!item.read && <View style={styles.unreadDot} />}

                {/* Icon */}
                <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon as any} size={22} color={cfg.color} />
                </View>

                {/* Text */}
                <View style={styles.textBlock}>
                    <Text style={[styles.title, !item.read && styles.titleBold]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    {item.body && (
                        <Text style={styles.body} numberOfLines={1}>{item.body}</Text>
                    )}
                    <Text style={styles.time}>{item.time}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name={getBackChevron()} size={24} color="#000" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    الاشعارات
                    {unreadCount > 0 && (
                        <Text style={styles.badge}> ({unreadCount})</Text>
                    )}
                </Text>

                <TouchableOpacity onPress={markAllRead} style={styles.headerBtn}>
                    <Ionicons name="checkmark-done-outline" size={22} color="#064E3B" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#064E3B" />
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="notifications-off-outline" size={64} color="#DDD" />
                    <Text style={styles.emptyText}>لا توجد إشعارات</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#064E3B"
                        />
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
    headerTitle: { fontSize: 18, fontFamily: 'Cairo_700Bold', color: '#000' },
    badge: { fontSize: 15, color: '#064E3B', fontFamily: 'Cairo_700Bold' },
    list: { padding: 16, paddingBottom: 32 },

    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
    textBlock: { flex: 1, alignItems: 'flex-start' },
    title: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#374151',
        textAlign: 'right',
        marginBottom: 3,
        lineHeight: 22,
    },
    titleBold: { fontFamily: 'Cairo_700Bold', color: '#111' },
    body: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        textAlign: 'right',
        marginBottom: 5,
    },
    time: { fontSize: 11, fontFamily: 'Cairo_400Regular', color: '#9CA3AF' },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    emptyText: { fontSize: 15, fontFamily: 'Cairo_400Regular', color: '#9CA3AF' },
});
