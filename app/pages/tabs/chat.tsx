import BottomNav from '@/components/BottomNav';
import apiService, { Conversation } from '@/config/apiService';
import { useAuth } from '@/config/authContext';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatListScreen() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        }
    }, [isAuthenticated, authLoading]);
    const [searchQuery, setSearchQuery] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            try {
                const res = await apiService.listConversations();
                const data = res?.data;
                setConversations(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Conversations fetch error:', error);
                setConversations([]);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    const filteredConversations = conversations.filter(c =>
        !searchQuery || (c.stylist?.name ?? '').includes(searchQuery)
    );

    const handleChatPress = (conversationId: number | string) => {
        router.push(`/pages/chat?id=${conversationId}` as any);
    };

    const renderConversation = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => handleChatPress(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.timeContainer}>
                {item.created_at ? (
                    <Text style={styles.timeText}>
                        {new Date(item.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                ) : null}
                {(item.unread_count ?? 0) > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread_count}</Text>
                    </View>
                )}
            </View>

            <View style={styles.conversationInfo}>
                <Text style={styles.conversationName}>{item.stylist?.name ?? 'منسقة'}</Text>
                {item.last_message ? (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message}
                    </Text>
                ) : null}
            </View>

            <View style={styles.avatarContainer}>
                <Image
                    source={item.stylist?.image ? { uri: item.stylist.image } : require('@/assets/stylewomen1.png')}
                    style={styles.avatar}
                />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="بحث"
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        textAlign="right"
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#064E3B" />
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderConversation}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>لا توجد محادثات</Text>
                        </View>
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
        backgroundColor: '#FFF',
    },
    searchContainer: {
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingVertical: scaleVertical(15),
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.lg,
        height: scaleVertical(45),
        gap: Spacing.md,
    },
    searchInput: {
        flex: 1,
        fontSize: FontSizes.body,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: scaleVertical(100),
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.screenPaddingHorizontal,
        paddingVertical: scaleVertical(15),
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: scale(55),
        height: scale(55),
        borderRadius: scale(27.5),
    },
    conversationInfo: {
        flex: 1,
        marginRight: Spacing.md,
        alignItems: 'flex-end',
    },
    conversationName: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        marginBottom: Spacing.verticalXs,
    },
    lastMessage: {
        fontSize: FontSizes.label,
        fontFamily: 'Cairo_400Regular',
        color: '#064E3B',
    },
    timeContainer: {
        alignItems: 'flex-start',
        gap: Spacing.verticalSm,
    },
    timeText: {
        fontSize: FontSizes.bodySmall,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    unreadBadge: {
        backgroundColor: '#064E3B',
        borderRadius: BorderRadius.round,
        minWidth: scale(20),
        height: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
    },
    unreadText: {
        fontSize: FontSizes.caption,
        fontFamily: 'Cairo_700Bold',
        color: '#FFF',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: scaleVertical(60),
    },
    emptyText: {
        fontFamily: 'Cairo_400Regular',
        fontSize: FontSizes.bodyLarge,
        color: '#999',
    },
});
