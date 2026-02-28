import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeHeaderProps {
    userName: string;
    greeting: string;
    avatarUri?: string;
    onSearchPress?: () => void;
    onNotificationPress?: () => void;
}

export default function HomeHeader({ userName, greeting, avatarUri, onSearchPress, onNotificationPress }: HomeHeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.leftButtons}>
                <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
                    <Ionicons name="search-outline" size={24} color="#064E3B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
                    <Ionicons name="notifications-outline" size={24} color="#064E3B" />
                </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.userName}>{userName}</Text>
            </View>

            <View style={styles.avatarContainer}>
                {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={20} color="#064E3B" />
                    </View>
                )}
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
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    leftButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
        alignItems: 'flex-end',
        marginRight: 12,
    },
    greeting: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    userName: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
