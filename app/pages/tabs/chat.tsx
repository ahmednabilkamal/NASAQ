import BottomNav from '@/components/BottomNav';
import ChatListSkeleton from '@/components/chat/ChatListSkeleton';
import StylistBottomNav from '@/components/StylistBottomNav';
import apiService, { Conversation } from '@/config/apiService';
import { useAuth } from '@/config/authContext';
import { isStylistUser, isStylistVerified } from '@/config/navigationFlow';
import { useChatUnread } from '@/providers/ChatUnreadProvider';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import { rtlInput, rtlText } from '@/config/rtlText';
import { pickResolvedEntityImageUrl, resolveMediaUrl } from '@/utils/resolveMediaUrl';

export default function ChatListScreen() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        }
    }, [isAuthenticated, authLoading]);
    const [searchQuery, setSearchQuery] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const stylistChatActive = isStylistUser(user) && isStylistVerified(user);
    const { syncUnreadFromConversations } = useChatUnread();

    const loadConversations = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = stylistChatActive
                ? await apiService.listStylistConversations()
                : await apiService.listConversations();
            const data = res?.data;
            const list = Array.isArray(data) ? data : [];
            setConversations(list);
            syncUnreadFromConversations(list);
        } catch (error) {
            console.error('Conversations fetch error:', error);
            setConversations([]);
            syncUnreadFromConversations([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, stylistChatActive, syncUnreadFromConversations]);

    useFocusEffect(
        useCallback(() => {
            void loadConversations();
        }, [loadConversations])
    );

    // Get the other party's name depending on role (API may nest or flatten stylist fields)
    const getContactName = (c: Conversation) => {
        if (stylistChatActive) {
            return c.user?.name ?? c.client?.name ?? (c as any).client_name ?? 'عميل';
        }
        const anyC = c as any;
        return (
            c.stylist?.name ??
            anyC.stylist_name ??
            anyC.other_user?.name ??
            anyC.participant_name ??
            anyC.title ??
            'منسّق'
        );
    };

    const getContactImage = (c: Conversation): string | undefined => {
        if (stylistChatActive) {
            return pickResolvedEntityImageUrl((c.user || c.client || { image: (c as any).client_image }) as any);
        }
        const anyC = c as any;
        return pickResolvedEntityImageUrl(anyC.stylist) ?? pickResolvedEntityImageUrl({ image: anyC.stylist_image });
    };

    const getLastMessagePreviewImage = (c: Conversation): string | undefined =>
        resolveMediaUrl(c.last_message_image_url);

    const filteredConversations = conversations.filter(c => {
        if (!searchQuery) return true;
        const name = getContactName(c);
        return name.includes(searchQuery);
    });

    const handleChatPress = (item: Conversation) => {
        const id = item.id;
        const closedAt = (item as { closed_at?: string | null }).closed_at;
        const isClosed = closedAt != null && String(closedAt) !== '';
        const qs = [`id=${id}`];
        if (isClosed) qs.push('readonly=1');
        router.push(`/pages/chat?${qs.join('&')}` as any);
    };

    const renderConversation = ({ item }: { item: Conversation }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => handleChatPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                {getContactImage(item) ? (
                    <Image source={{ uri: getContactImage(item)! }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={26} color="#999" />
                    </View>
                )}
            </View>

            <View style={styles.conversationInfo}>
                <Text style={styles.conversationName} numberOfLines={1}>
                    {getContactName(item)}
                </Text>
                {getLastMessagePreviewImage(item) ? (
                    <Image
                        source={{ uri: getLastMessagePreviewImage(item)! }}
                        style={styles.lastMessageThumb}
                        resizeMode="cover"
                    />
                ) : null}
                {item.last_message ? (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message}
                    </Text>
                ) : null}
            </View>

            <View style={styles.timeContainer}>
                {item.created_at ? (
                    <Text style={styles.timeText}>
                        {new Date(item.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                ) : null}
                {(item.unread_count ?? 0) > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                            {(item.unread_count ?? 0) > 99 ? '99+' : item.unread_count}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, userScreenDirection]} edges={['top']}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="بحث"
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Conversations List */}
            {loading ? (
                <ChatListSkeleton />
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

            {stylistChatActive ? <StylistBottomNav /> : <BottomNav />}
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
    },
    searchIcon: {
        marginEnd: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
        paddingVertical: 0,
        ...rtlInput,
    },
    listContent: {
        paddingBottom: 100,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatarContainer: {
        position: 'relative',
        marginTop: 2,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
    },
    avatarPlaceholder: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    conversationInfo: {
        flex: 1,
        minWidth: 0,
        marginStart: 12,
        alignItems: 'stretch',
    },
    conversationName: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        marginBottom: 4,
        width: '100%',
        ...rtlText.alignStart,
    },
    lastMessageThumb: {
        width: 52,
        height: 52,
        borderRadius: 8,
        marginBottom: 4,
        backgroundColor: '#F3F4F6',
    },
    lastMessage: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#064E3B',
        width: '100%',
        ...rtlText.alignStart,
    },
    timeContainer: {
        alignItems: 'center',
        marginStart: 8,
        marginTop: 2,
    },
    timeText: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        writingDirection: 'ltr',
    },
    unreadBadge: {
        backgroundColor: '#064E3B',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginTop: 8,
    },
    unreadText: {
        fontSize: 11,
        fontFamily: 'Cairo_700Bold',
        color: '#FFF',
        writingDirection: 'ltr',
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
        ...rtlText.alignStart,
    },
});
