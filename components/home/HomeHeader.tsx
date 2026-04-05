import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { resolveMediaUrl } from '@/utils/resolveMediaUrl';
import { Ionicons } from '@expo/vector-icons';
import { rtlText } from '@/config/rtlText';

interface HomeHeaderProps {
    userName: string;
    greeting: string;
    avatarUri?: string;
    onSearchPress?: () => void;
    onNotificationPress?: () => void;
}

export default function HomeHeader({ userName, greeting, avatarUri, onSearchPress, onNotificationPress }: HomeHeaderProps) {
    const avatarResolved = resolveMediaUrl(avatarUri);
    return (
        <View style={styles.container}>
            {/* JSX order matches stylist home: avatar + name block first, actions last; forceRTL mirrors row. */}
            <View style={styles.avatarContainer}>
                {avatarResolved ? (
                    <Image source={{ uri: avatarResolved }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={20} color="#064E3B" />
                    </View>
                )}
            </View>

            <View style={styles.userInfo}>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.userName}>{userName}</Text>
            </View>

            <View style={styles.leftButtons}>
                <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
                    <Ionicons name="search-outline" size={24} color="#064E3B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
                    <Ionicons name="notifications-outline" size={24} color="#064E3B" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#fff',
        gap: 12,
    },
    leftButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    userInfo: {
        flex: 1,
        alignItems: 'flex-start',
    },
    greeting: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        marginBottom: -2,
        ...rtlText.alignStart,
    },
    userName: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        ...rtlText.alignStart,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
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
});

