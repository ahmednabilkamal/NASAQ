import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const MOCK_MESSAGES = [
    { id: '1', text: 'هتوصلي دلوقتى، والتعديل متاح', sender: 'stylist' },
    { id: '2', text: 'جامدة اوي التصور', sender: 'user' },
    { id: '3', text: 'هتوصلي دلوقتى، والتعديل متاح', sender: 'stylist' },
    { id: '4', text: 'جامدة اوي التصور', sender: 'user' },
];

export default function ChatScreen() {
    const router = useRouter();
    const isRTL = I18nManager.isRTL;
    const [message, setMessage] = useState('');

    const MessageItem = ({ item }: any) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.stylistWrapper]}>
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.stylistBubble]}>
                    <Text style={[styles.messageText, isUser ? styles.userText : styles.stylistText]}>
                        {item.text}
                    </Text>
                </View>
                {!isUser && (
                    <Image
                        source={require('@/assets/page1bg.png')}
                        style={styles.stylistAvatar}
                    />
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>داليا فؤاد</Text>
                    <View style={styles.onlineStatus} />
                </View>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={MOCK_MESSAGES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageItem item={item} />}
                contentContainerStyle={styles.listContent}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="attach-outline" size={24} color="#999" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="اكتب الرسالة هنا..."
                        value={message}
                        onChangeText={setMessage}
                        textAlign={isRTL ? "right" : "left"}
                    />
                    <TouchableOpacity style={styles.sendButton}>
                        <Ionicons name="mic-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerInfo: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    headerName: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    onlineStatus: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
    },
    listContent: {
        padding: 20,
    },
    messageWrapper: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-end',
    },
    userWrapper: {
        justifyContent: 'flex-end',
    },
    stylistWrapper: {
        justifyContent: 'flex-start',
        gap: 10,
    },
    messageBubble: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        maxWidth: '75%',
    },
    userBubble: {
        backgroundColor: '#064E3B',
        borderBottomRightRadius: 5,
    },
    stylistBubble: {
        backgroundColor: '#F0F5F2',
        borderBottomLeftRadius: 5,
    },
    messageText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
    },
    userText: {
        color: '#FFF',
    },
    stylistText: {
        color: '#000',
    },
    stylistAvatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    attachButton: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 45,
        backgroundColor: '#F5F5F5',
        borderRadius: 22.5,
        paddingHorizontal: 20,
        fontFamily: 'Cairo_400Regular',
    },
    sendButton: {
        marginLeft: 10,
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
