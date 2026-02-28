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
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const MOCK_MESSAGES = [
    { id: '1', text: 'هتوصلك دلوقتي، والتعديل متاح', sender: 'stylist', time: '10 AM' },
    { id: '2', text: 'جاهزة لأي تغيير', sender: 'user', time: '10 AM' },
    { id: '3', text: 'هتوصلك دلوقتي، والتعديل متاح', sender: 'stylist', time: '10 AM' },
    { id: '4', text: 'جاهزة لأي تغيير', sender: 'user', time: '10 AM' },
    { id: '5', text: 'هتوصلك دلوقتي، والتعديل متاح', sender: 'stylist', time: '10 AM' },
    { id: '6', text: 'جاهزة لأي تغيير', sender: 'user', time: '10 AM' },
];

export default function ChatScreen() {
    const router = useRouter();
    const isRTL = I18nManager.isRTL;
    const [message, setMessage] = useState('');
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    const MessageItem = ({ item }: any) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.stylistMessageContainer]}>
                {!isUser && (
                    <Image
                        source={require('@/assets/stylewomen1.png')}
                        style={styles.stylistAvatar}
                    />
                )}
                <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.stylistWrapper]}>
                    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.stylistBubble]}>
                        <Text style={[styles.messageText, isUser ? styles.userText : styles.stylistText]}>
                            {item.text}
                        </Text>
                    </View>
                    <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>{item.time}</Text>
                </View>
                {isUser && (
                    <Image
                        source={require('@/assets/stylewomen2.png')}
                        style={styles.userAvatar}
                    />
                )}
            </View>
        );
    };

    const handleSend = () => {
        if (message.trim()) {
            // Send message logic here
            setMessage('');
        }
    };

    const handleRatingSubmit = () => {
        if (rating > 0) {
            setRatingSubmitted(true);
            setTimeout(() => {
                setShowRatingModal(false);
                setRatingSubmitted(false);
                setRating(0);
                setFeedback('');
            }, 2000);
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
                                source={require('@/assets/stylewomen1.png')}
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
                <Text style={styles.headerName}>داليا فؤاد</Text>
                <TouchableOpacity
                    style={styles.rateButton}
                    onPress={() => setShowRatingModal(true)}
                >
                    <Ionicons name="star-outline" size={22} color="#064E3B" />
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            <FlatList
                data={MOCK_MESSAGES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageItem item={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Attachment Menu */}
            {showAttachMenu && (
                <View style={styles.attachMenu}>
                    <TouchableOpacity style={styles.attachOption}>
                        <View style={styles.attachIconContainer}>
                            <View style={styles.attachIconPhotos}>
                                <Ionicons name="images" size={24} color="#FFF" />
                            </View>
                            <Text style={styles.attachOptionText}>الصور</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachOption}>
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
                    />

                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSend}
                    >
                        <Ionicons
                            name={message.trim() ? "send" : "mic-outline"}
                            size={22}
                            color="#FFF"
                        />
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
        alignItems: 'flex-end',
    },
    messageWrapper: {
        flex: 1,
        maxWidth: '70%',
    },
    userWrapper: {
        alignItems: 'flex-start',
        marginRight: 10,
    },
    stylistWrapper: {
        alignItems: 'flex-end',
        marginLeft: 10,
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    userBubble: {
        backgroundColor: '#E8F5E9',
        borderBottomLeftRadius: 5,
    },
    stylistBubble: {
        backgroundColor: '#064E3B',
        borderBottomRightRadius: 5,
    },
    messageText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        lineHeight: 22,
    },
    userText: {
        color: '#333',
        textAlign: 'left',
    },
    stylistText: {
        color: '#FFF',
        textAlign: 'right',
    },
    messageTime: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        marginTop: 4,
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
