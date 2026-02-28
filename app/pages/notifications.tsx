import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const NOTIFICATIONS = [
    {
        id: '1',
        title: 'المنسقة سارة أرسلت لك رسالة جديدة',
        time: 'اليوم | 03:30 مساءً',
        type: 'message',
    },
    {
        id: '2',
        title: 'تم تأكيد باقة التنسيق بنجاح',
        time: 'الثلاثاء | 04:30 مساءً',
        type: 'success',
    },
    {
        id: '3',
        title: 'عرض خاص على باقات التنسيق',
        time: 'الثلاثاء | 04:30 مساءً',
        type: 'offer',
    },
];

export default function NotificationsScreen() {
    const router = useRouter();

    const getIcon = (type: string) => {
        switch (type) {
            case 'message':
                return 'chatbubble-ellipses';
            case 'success':
                return 'checkmark-circle';
            case 'offer':
                return 'pricetag';
            default:
                return 'notifications';
        }
    };

    const renderNotification = ({ item }: { item: typeof NOTIFICATIONS[0] }) => (
        <TouchableOpacity style={styles.notificationItem}>
            <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
            <View style={styles.iconContainer}>
                <Ionicons name={getIcon(item.type)} size={22} color="#064E3B" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>الاشعارات</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={NOTIFICATIONS}
                keyExtractor={(item) => item.id}
                renderItem={renderNotification}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
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
        color: '#000',
    },
    listContent: {
        padding: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationContent: {
        flex: 1,
        marginRight: 12,
        alignItems: 'flex-end',
    },
    notificationTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_600SemiBold',
        color: '#333',
        textAlign: 'right',
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
});
