import BottomNav from '@/components/BottomNav';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock conversations data
const CONVERSATIONS = [
    {
        id: '1',
        name: 'داليا فؤاد',
        lastMessage: 'داليا فؤاد تكتب..',
        time: '14:28',
        unreadCount: 1,
        isOnline: true,
        avatar: require('@/assets/stylewomen1.png'),
    },
    {
        id: '2',
        name: 'داليا فؤاد',
        lastMessage: 'داليا فؤاد تكتب..',
        time: '14:28',
        unreadCount: 1,
        isOnline: true,
        avatar: require('@/assets/stylewomen2.png'),
    },
    {
        id: '3',
        name: 'داليا فؤاد',
        lastMessage: 'داليا فؤاد تكتب..',
        time: '14:28',
        unreadCount: 1,
        isOnline: true,
        avatar: require('@/assets/stylewomen3.png'),
    },
    {
        id: '4',
        name: 'داليا فؤاد',
        lastMessage: 'داليا فؤاد تكتب..',
        time: '14:28',
        unreadCount: 1,
        isOnline: true,
        avatar: require('@/assets/stylewomen1.png'),
    },
    {
        id: '5',
        name: 'داليا فؤاد',
        lastMessage: 'داليا فؤاد تكتب..',
        time: '14:28',
        unreadCount: 1,
        isOnline: true,
        avatar: require('@/assets/stylewomen2.png'),
    },
    {
        id: '6',
        name: 'داليا فؤاد',
        lastMessage: 'داليا فؤاد تكتب..',
        time: '14:28',
        unreadCount: 1,
        isOnline: false,
        avatar: require('@/assets/stylewomen3.png'),
    },
];

export default function ChatListScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleChatPress = (conversationId: string) => {
        router.push(`/pages/chat?id=${conversationId}` as any);
    };

    const renderConversation = ({ item }: { item: typeof CONVERSATIONS[0] }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => handleChatPress(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{item.time}</Text>
                {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                )}
            </View>

            <View style={styles.conversationInfo}>
                <Text style={styles.conversationName}>{item.name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>

            <View style={styles.avatarContainer}>
                <Image source={item.avatar} style={styles.avatar} />
                {item.isOnline && <View style={styles.onlineIndicator} />}
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
            <FlatList
                data={CONVERSATIONS}
                keyExtractor={(item) => item.id}
                renderItem={renderConversation}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

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
    onlineIndicator: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#FFF',
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
});
