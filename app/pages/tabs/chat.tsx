import BottomNav from '@/components/BottomNav';
import apiService, { Conversation } from '@/config/apiService';
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
    const router = useRouter();
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
            {/* Search Bar */}
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

            {/* Conversations List */}
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
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 45,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 100,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
    },
    conversationInfo: {
        flex: 1,
        marginRight: 12,
        alignItems: 'flex-end',
    },
    conversationName: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        marginBottom: 3,
    },
    lastMessage: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#064E3B',
    },
    timeContainer: {
        alignItems: 'flex-start',
        gap: 8,
    },
    timeText: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    unreadBadge: {
        backgroundColor: '#064E3B',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadText: {
        fontSize: 11,
        fontFamily: 'Cairo_700Bold',
        color: '#FFF',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 16,
        color: '#999',
    },
});
