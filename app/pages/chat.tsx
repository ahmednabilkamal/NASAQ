import React, { useState, useEffect, useRef } from 'react';
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
    Modal,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiService, { Message, Stylist } from '@/config/apiService';
import { useAuth } from '@/config/authContext';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

export default function ChatScreen() {
    const router = useRouter();
    const { id: conversationId } = useLocalSearchParams<{ id: string }>();
    const isRTL = I18nManager.isRTL;
    const { user } = useAuth();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [stylist, setStylist] = useState<Stylist | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Recording state
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    const fetchMessages = async (showLoading = false) => {
        if (!conversationId) return;
        if (showLoading) setLoading(true);
        try {
            const res = await apiService.getMessages(conversationId);
            const data = res?.data;
            if (Array.isArray(data)) {
                // Reverse because usually APIs return newest first, but FlatList displays bottom-up
                // Or check the order. If API returns oldest first, we might need inverted list.
                // Assuming standard list for now.
                setMessages(data);
            }

            // Try to find stylist info from conversation if we don't have it
            if (!stylist) {
                const convRes = await apiService.listConversations();
                const currentConv = convRes.data.find(c => String(c.id) === conversationId);
                if (currentConv?.stylist) {
                    setStylist(currentConv.stylist);
                }
            }
        } catch (error) {
            console.error('Fetch messages error:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages(true);
        // Basic polling for new messages (every 5 seconds)
        const interval = setInterval(() => fetchMessages(), 5000);
        return () => clearInterval(interval);
    }, [conversationId]);

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            uploadFile(result.assets[0].uri, 'image', result.assets[0].fileName || 'image.jpg');
            setShowAttachMenu(false);
        }
    };

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                uploadFile(result.assets[0].uri, 'file', result.assets[0].name);
                setShowAttachMenu(false);
            }
        } catch (err) {
            console.log('Document picker error:', err);
        }
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(recording);
                setIsRecording(true);
            }
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;
        setIsRecording(false);
        setRecording(null);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
            uploadFile(uri, 'audio', 'voice_message.m4a');
        }
    };

    const uploadFile = async (uri: string, type: 'image' | 'file' | 'audio', name: string) => {
        if (!conversationId) return;
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                name,
                type: type === 'image' ? 'image/jpeg' : type === 'audio' ? 'audio/m4a' : 'application/octet-stream',
            } as any);

            // Backend might expect specific field for body even with file
            formData.append('body', `Shared a ${type}`);

            await apiService.sendMessage(conversationId, formData);
            fetchMessages();
        } catch (error) {
            console.error('FileUpload error:', error);
        } finally {
            setSending(false);
        }
    };

    const MessageItem = ({ item }: { item: Message }) => {
        // sender_type usually comes from the backend to identify if it's the user or stylist
        // For Venus app, assuming user is 'user' and stylist is 'stylist' or similar
        const isUser = item.sender_type === 'user' || item.user_id === user?.id;

        return (
            <View style={[styles.messageContainer, isUser ? styles.userContainer : styles.stylistContainer]}>
                {!isUser && (
                    <Image
                        source={stylist?.image ? { uri: stylist.image } : require('@/assets/mirroimagewomen.png')}
                        style={styles.stylistAvatar}
                    />
                )}
                <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.stylistWrapper]}>
                    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.stylistBubble]}>
                        <Text style={[styles.messageText, isUser ? styles.userText : styles.stylistText]}>
                            {item.body}
                        </Text>
                    </View>
                    <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                </View>
                {isUser && (
                    <Image
                        source={user?.image ? { uri: user.image } : require('@/assets/stylewomen2.png')}
                        style={styles.userAvatar}
                    />
                )}
            </View>
        );
    };

    const handleSend = async () => {
        if (!message.trim() || !conversationId || sending) return;

        setSending(true);
        const textToSend = message.trim();
        setMessage('');

        try {
            await apiService.sendMessage(conversationId, textToSend);
            await fetchMessages(); // Immediate refresh
            setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
        } catch (error) {
            console.error('Send message error:', error);
            setMessage(textToSend); // Restore message on failure
        } finally {
            setSending(false);
        }
    };

    const handleRatingSubmit = async () => {
        if (rating > 0 && stylist?.id) {
            try {
                // Assuming createReview works for stylists or we need a specific endpoint
                await apiService.createReview({
                    stylist_id: Number(stylist.id),
                    rating: rating,
                    comment: feedback
                });

                setRatingSubmitted(true);
                setTimeout(() => {
                    setShowRatingModal(false);
                    setRatingSubmitted(false);
                    setRating(0);
                    setFeedback('');
                }, 2000);
            } catch (error) {
                console.error('Rating submit error:', error);
            }
        }
    };

    const StarRating = () => (
        <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={36}
                        color={star <= rating ? '#FFD700' : '#DDD'}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    const RatingModal = () => (
        <Modal
            visible={showRatingModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowRatingModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {ratingSubmitted ? (
                        <View style={styles.successContainer}>
                            <View style={styles.successIconContainer}>
                                <Ionicons name="checkmark" size={40} color="#FFF" />
                            </View>
                            <Text style={styles.successText}>شكراً لمشاركتك رأيك</Text>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowRatingModal(false)}
                            >
                                <Ionicons name="close" size={24} color="#999" />
                            </TouchableOpacity>

                            <Image
                                source={stylist?.image ? { uri: stylist.image } : require('@/assets/mirroimagewomen.png')}
                                style={styles.modalAvatar}
                            />

                            <Text style={styles.modalTitle}>قيمي تجربتك مع المنسقة</Text>

                            <StarRating />

                            <TextInput
                                style={styles.feedbackInput}
                                placeholder="شاركينا رأيك..."
                                placeholderTextColor="#999"
                                value={feedback}
                                onChangeText={setFeedback}
                                textAlign="right"
                                multiline
                                numberOfLines={4}
                            />

                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    rating === 0 && styles.submitButtonDisabled,
                                ]}
                                onPress={handleRatingSubmit}
                                disabled={rating === 0}
                            >
                                <Text style={styles.submitButtonText}>إرسال</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Rating Modal */}
            <RatingModal />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-forward" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerName}>{stylist?.name ?? 'منسقة'}</Text>
                <TouchableOpacity
                    style={styles.rateButton}
                    onPress={() => setShowRatingModal(true)}
                >
                    <Ionicons name="star-outline" size={22} color="#064E3B" />
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#064E3B" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => <MessageItem item={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>ابدئي المحادثة الآن</Text>
                        </View>
                    }
                />
            )}

            {/* Attachment Menu */}
            {showAttachMenu && (
                <View style={styles.attachMenu}>
                    <TouchableOpacity style={styles.attachOption} onPress={handlePickImage}>
                        <View style={styles.attachIconContainer}>
                            <View style={styles.attachIconPhotos}>
                                <Ionicons name="images" size={24} color="#FFF" />
                            </View>
                            <Text style={styles.attachOptionText}>الصور</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachOption} onPress={handlePickDocument}>
                        <View style={styles.attachIconContainer}>
                            <View style={styles.attachIconFiles}>
                                <Ionicons name="document-text" size={24} color="#FFF" />
                            </View>
                            <Text style={styles.attachOptionText}>الملفات</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.inputContainer}>
                    <TouchableOpacity
                        style={styles.attachButton}
                        onPress={() => setShowAttachMenu(!showAttachMenu)}
                    >
                        <Ionicons name="attach-outline" size={24} color="#666" />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="اكتب الرسالة هنا..."
                        placeholderTextColor="#999"
                        value={message}
                        onChangeText={setMessage}
                        textAlign="right"
                        multiline
                        editable={!sending}
                    />

                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            sending && styles.sendButtonDisabled,
                            isRecording && styles.recordingButton
                        ]}
                        onPress={message.trim() ? handleSend : (isRecording ? stopRecording : startRecording)}
                        disabled={sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons
                                name={message.trim() ? "send" : (isRecording ? "stop" : "mic-outline")}
                                size={22}
                                color="#FFF"
                            />
                        )}
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
    headerName: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
    },
    listContent: {
        padding: 15,
        paddingBottom: 20,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        width: '100%',
        alignItems: 'flex-end',
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    stylistContainer: {
        justifyContent: 'flex-start',
    },
    messageWrapper: {
        maxWidth: '75%',
    },
    userWrapper: {
        alignItems: 'flex-end',
        marginRight: 10,
    },
    stylistWrapper: {
        alignItems: 'flex-start',
        marginLeft: 10,
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    userBubble: {
        backgroundColor: '#E8F5E9',
        borderBottomRightRadius: 5,
    },
    stylistBubble: {
        backgroundColor: '#064E3B',
        borderBottomLeftRadius: 5,
    },
    messageText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        lineHeight: 22,
    },
    userText: {
        color: '#333',
        textAlign: 'right',
    },
    stylistText: {
        color: '#FFF',
        textAlign: 'left',
    },
    messageTime: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        marginTop: 4,
    },
    userMessageTime: {
        textAlign: 'right',
    },
    stylistAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    recordingButton: {
        backgroundColor: '#FF3B30',
    },
    attachMenu: {
        position: 'absolute',
        bottom: 75,
        left: 20,
        right: 20,
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    attachOption: {
        alignItems: 'center',
    },
    attachIconContainer: {
        alignItems: 'center',
        gap: 8,
    },
    attachIconPhotos: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FF6B9D',
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachIconFiles: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachOptionText: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: '#FFF',
    },
    attachButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 100,
        backgroundColor: '#F5F5F5',
        borderRadius: 22,
        paddingHorizontal: 18,
        paddingVertical: 10,
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#333',
    },
    sendButton: {
        marginLeft: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rateButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 25,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        left: 15,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    feedbackInput: {
        width: '100%',
        minHeight: 100,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 15,
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#333',
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    submitButton: {
        width: '100%',
        backgroundColor: '#064E3B',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#CCC',
    },
    submitButtonText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#FFF',
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    successIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successText: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        textAlign: 'center',
    },
});
