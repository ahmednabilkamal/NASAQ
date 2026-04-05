import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
    Modal,
    ActivityIndicator,
    Pressable,
    Keyboard,
    InteractionManager,
    Linking,
    Alert,
    Dimensions,
} from 'react-native';
import axios, { isAxiosError } from 'axios';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userScreenDirection, stylistScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiService, { Message, Stylist } from '@/config/apiService';
import { useAuth } from '@/config/authContext';
import { useChatUnread } from '@/providers/ChatUnreadProvider';
import { isStylistUser } from '@/config/navigationFlow';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video, ResizeMode } from 'expo-av';
import { getBackChevron, getForwardChevron } from '@/config/directionalIcons';
import ChatThreadSkeleton from '@/components/chat/ChatThreadSkeleton';
import { pickResolvedEntityImageUrl, resolveMediaUrl } from '@/utils/resolveMediaUrl';

/** Min height of composer row (padding + controls) — placeholder when attach Modal is open. */
const COMPOSER_MIN_HEIGHT = 64;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function paramIsReadonly(raw: string | string[] | undefined): boolean {
    const v = Array.isArray(raw) ? raw[0] : raw;
    return v === '1' || v === 'true';
}

export default function ChatScreen() {
    const router = useRouter();
    const {
        id: conversationId,
        readonly: readonlyParam,
        messageId: messageIdParam,
        peerName: peerNameParam,
        contextOrderId: contextOrderIdParam,
    } = useLocalSearchParams<{
        id: string;
        readonly?: string;
        messageId?: string;
        peerName?: string;
        contextOrderId?: string;
    }>();
    const isReadonly = paramIsReadonly(readonlyParam);
    /** Server closed the thread (e.g. order completed); same UX as URL readonly=1. */
    const [conversationClosed, setConversationClosed] = useState(false);
    const effectiveReadonly = isReadonly || conversationClosed;

    const peerNameFromRoute = useMemo(() => {
        const raw = Array.isArray(peerNameParam) ? peerNameParam[0] : peerNameParam;
        if (raw == null || String(raw) === '') return '';
        try {
            return decodeURIComponent(String(raw));
        } catch {
            return String(raw);
        }
    }, [peerNameParam]);

    const contextOrderId = useMemo(() => {
        const raw = Array.isArray(contextOrderIdParam) ? contextOrderIdParam[0] : contextOrderIdParam;
        return raw != null && String(raw) !== '' ? String(raw) : null;
    }, [contextOrderIdParam]);
    const { user } = useAuth();
    const { refreshChatUnread } = useChatUnread();
    const isStylist = isStylistUser(user);
    const insets = useSafeAreaInsets();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [stylist, setStylist] = useState<Stylist | null>(null);
    const [peerClient, setPeerClient] = useState<{ id?: number | string; name?: string; image?: string } | null>(
        null
    );
    const [relatedOrderId, setRelatedOrderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [mediaViewer, setMediaViewer] = useState<{ type: 'image' | 'video'; uri: string } | null>(null);
    const mediaVideoRef = useRef<Video | null>(null);

    const flatListRef = useRef<FlatList<Message>>(null);
    const targetMessageId = useMemo(() => {
        const raw = Array.isArray(messageIdParam) ? messageIdParam[0] : messageIdParam;
        return raw != null && String(raw) !== '' ? String(raw) : null;
    }, [messageIdParam]);
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
    /** When false, skip auto scrollToEnd so deep-link scrollToIndex can run first. */
    const [allowAutoScrollToEnd, setAllowAutoScrollToEnd] = useState(() => !targetMessageId);

    useEffect(() => {
        setConversationClosed(false);
    }, [conversationId]);

    const fetchMessages = async (showLoading = false) => {
        if (!conversationId) return;
        if (showLoading) setLoading(true);
        try {
            if (isStylist) {
                const res = await apiService.getStylistMessages(conversationId);
                const data = res?.data;
                if (Array.isArray(data)) {
                    setMessages(data);
                }
                const convRes = await apiService.listStylistConversations({ skipErrorToast: true });
                const list = Array.isArray(convRes?.data) ? convRes.data : [];
                const currentConv = list.find((c) => String(c.id) === String(conversationId));
                if (currentConv) {
                    const ca = currentConv.closed_at;
                    setConversationClosed(ca != null && String(ca) !== '');
                    const u = currentConv.user;
                    if (u) {
                        setPeerClient((prev) =>
                            prev
                                ? prev
                                : {
                                      id: u.id,
                                      name: u.name,
                                      image: pickResolvedEntityImageUrl(u as any) ?? (u as any).image,
                                  }
                        );
                    }
                }
                } else {
                    const res = await apiService.getMessages(conversationId);
                    const data = res?.data;
                    if (Array.isArray(data)) {
                        setMessages(data);
                    }
                    const convRes = await apiService.listConversations({ skipErrorToast: true });
                    const list = Array.isArray(convRes?.data) ? convRes.data : [];
                    const currentConv = list.find((c) => String(c.id) === String(conversationId));
                    if (currentConv) {
                        const ca = currentConv.closed_at;
                        setConversationClosed(ca != null && String(ca) !== '');
                        if (currentConv.stylist) {
                            setStylist((prev) => prev ?? currentConv.stylist!);
                        }
                    }
                }
                void refreshChatUnread();
            } catch (error) {
            console.error('Fetch messages error:', error);
            if (isAxiosError(error) && error.response?.status === 403) {
                setMessages([]);
                if (isReadonly) {
                    Alert.alert(
                        'تعذر تحميل السجل',
                        'الخادم رفض عرض الرسائل لهذه المحادثة. بعد تحديث الخادم ستُعرض تلقائياً. يمكنك فتح نفس المحادثة من تبويب المحادثات.',
                        [{ text: 'حسناً' }]
                    );
                } else {
                    Alert.alert('تنبيه', 'المحادثة غير متاحة إلا مع طلب نشط.', [
                        { text: 'حسناً', onPress: () => router.back() },
                    ]);
                }
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages(true);
        if (effectiveReadonly) {
            return undefined;
        }
        const interval = setInterval(() => fetchMessages(), 5000);
        return () => clearInterval(interval);
    }, [conversationId, isStylist, effectiveReadonly]);

    useEffect(() => {
        if (!targetMessageId) {
            setAllowAutoScrollToEnd(true);
            return;
        }
        setAllowAutoScrollToEnd(false);
        setHighlightedMessageId(null);
    }, [targetMessageId, conversationId]);

    useEffect(() => {
        if (!targetMessageId || loading || messages.length === 0) {
            if (!targetMessageId) {
                setAllowAutoScrollToEnd(true);
            }
            return;
        }

        const index = messages.findIndex((m) => String(m.id) === targetMessageId);
        if (index < 0) {
            setAllowAutoScrollToEnd(true);
            return;
        }

        const t = requestAnimationFrame(() => {
            InteractionManager.runAfterInteractions(() => {
                flatListRef.current?.scrollToIndex({
                    index,
                    viewPosition: 0.4,
                    animated: true,
                });
                setHighlightedMessageId(targetMessageId);
                setAllowAutoScrollToEnd(true);
            });
        });
        return () => cancelAnimationFrame(t);
    }, [targetMessageId, loading, messages]);

    useEffect(() => {
        let cancelled = false;
        const resolveRelatedOrder = async () => {
            if (!conversationId || effectiveReadonly) {
                setRelatedOrderId(null);
                return;
            }
            try {
                if (isStylist) {
                    const clientId = peerClient?.id;
                    if (clientId == null) {
                        if (!cancelled) setRelatedOrderId(null);
                        return;
                    }
                    const res = await apiService.getStylistOrders({ per_page: 40 });
                    const list = Array.isArray(res?.data) ? res.data : [];
                    const match = list.find((o: any) => String(o.user_id) === String(clientId));
                    if (!cancelled) setRelatedOrderId(match?.id != null ? String(match.id) : null);
                } else {
                    const sid = stylist?.id;
                    if (sid == null) {
                        if (!cancelled) setRelatedOrderId(null);
                        return;
                    }
                    const res = await apiService.getUserOrders({ per_page: 40 });
                    const list = Array.isArray(res?.data) ? res.data : [];
                    const match = list.find(
                        (o: any) => String(o.stylist_id ?? o.stylist?.id) === String(sid)
                    );
                    if (!cancelled) setRelatedOrderId(match?.id != null ? String(match.id) : null);
                }
            } catch {
                if (!cancelled) setRelatedOrderId(null);
            }
        };
        resolveRelatedOrder();
        return () => {
            cancelled = true;
        };
    }, [conversationId, isStylist, effectiveReadonly, stylist?.id, peerClient?.id]);

    const handlePickGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert('تنبيه', 'نحتاج صلاحية الوصول إلى معرض الصور والفيديو.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: false,
            quality: 0.9,
        });

        if (result.canceled || !result.assets?.[0]) return;

        const asset = result.assets[0];
        const type = asset.type;
        const isVideo =
            type === 'video' ||
            (asset.mimeType != null && String(asset.mimeType).startsWith('video/'));

        const name =
            asset.fileName ||
            (isVideo ? 'video.mp4' : 'photo.jpg');
        const mime = asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg');

        uploadMedia(asset.uri, isVideo ? 'video' : 'image', name, mime);
        setShowAttachMenu(false);
    };

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                const asset = result.assets && result.assets[0];
                if (!asset) return;
                const mime = asset.mimeType || '';
                const name = asset.name || 'file';

                if (mime.startsWith('image/')) {
                    uploadMedia(asset.uri, 'image', name, mime);
                } else if (mime.startsWith('video/')) {
                    uploadMedia(asset.uri, 'video', name, mime);
                } else {
                    Alert.alert('تنبيه', 'هذا النوع غير مدعوم حالياً. فقط الصور والفيديو مدعومان.');
                    return;
                }
                setShowAttachMenu(false);
            }
        } catch (err) {
            console.log('Document picker error:', err);
        }
    };

    const uploadMedia = async (
        uri: string,
        kind: 'image' | 'video',
        name: string,
        mimeType: string
    ) => {
        if (effectiveReadonly || !conversationId) return;
        setSending(true);
        try {
            const formData = new FormData();
            const typedBody = message.trim();
            if (typedBody) {
                formData.append('body', typedBody);
                setMessage('');
            }

            if (kind === 'image') {
                formData.append('images[]', {
                    uri,
                    name,
                    type: mimeType || 'image/jpeg',
                } as any);
            } else {
                formData.append('videos[]', {
                    uri,
                    name,
                    type: mimeType || 'video/mp4',
                } as any);
            }

            if (isStylist) {
                await apiService.sendStylistMessage(conversationId, formData);
            } else {
                await apiService.sendMessage(conversationId, formData);
            }
            fetchMessages();
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setSending(false);
        }
    };

    const closeMediaViewer = useCallback(async () => {
        try {
            const v = mediaVideoRef.current;
            if (v) {
                await v.pauseAsync();
                await v.unloadAsync();
            }
        } catch {
            /* ignore */
        }
        mediaVideoRef.current = null;
        setMediaViewer(null);
    }, []);

    const MessageItem = ({ item }: { item: Message }) => {
        const isMine = isStylist
            ? item.sender_type === 'stylist'
            : item.sender_type === 'user' || String(item.user_id) === String(user?.id);

        const attachmentsRaw =
            (item as any).attachments_with_url ??
            (item as any).attachments ??
            [];

        const attachments = Array.isArray(attachmentsRaw) ? attachmentsRaw : [];

        const otherImageUri = isStylist
            ? pickResolvedEntityImageUrl(peerClient as any) ?? resolveMediaUrl(peerClient?.image)
            : pickResolvedEntityImageUrl(stylist as any) ?? resolveMediaUrl((stylist as any)?.image);
        const selfImageUri = resolveMediaUrl(user?.image as string | undefined);

        const isHighlighted = highlightedMessageId != null && String(item.id) === highlightedMessageId;

        return (
            <View
                style={[
                    styles.messageContainer,
                    isMine ? styles.userContainer : styles.stylistContainer,
                    isHighlighted ? styles.messageHighlighted : null,
                ]}
            >
                {!isMine &&
                    (otherImageUri ? (
                        <Image source={{ uri: otherImageUri }} style={styles.stylistAvatar} />
                    ) : (
                        <View style={[styles.stylistAvatar, styles.chatAvatarPlaceholder]}>
                            <Ionicons name="person" size={20} color="#999" />
                        </View>
                    ))}
                <View style={[styles.messageWrapper, isMine ? styles.userWrapper : styles.stylistWrapper]}>
                    <View style={[styles.messageBubble, isMine ? styles.userBubble : styles.stylistBubble]}>
                        {item.body ? (
                            <Text style={[styles.messageText, isMine ? styles.userText : styles.stylistText]}>
                                {item.body}
                            </Text>
                        ) : null}

                        {attachments.length ? (
                            <View style={styles.attachmentsWrap}>
                                {attachments.map((a: any, idx: number) => {
                                    const type = String(a.type ?? '');
                                    const url = resolveMediaUrl(String(a.url ?? '')) ?? String(a.url ?? '');
                                    if (!url) return null;

                                    if (type === 'image') {
                                        return (
                                            <TouchableOpacity
                                                key={String(a.id ?? idx)}
                                                activeOpacity={0.9}
                                                onPress={() => setMediaViewer({ type: 'image', uri: url })}
                                                accessibilityRole="button"
                                                accessibilityLabel="عرض الصورة بالحجم الكامل"
                                            >
                                                <Image
                                                    source={{ uri: url }}
                                                    style={styles.attachmentImage}
                                                    resizeMode="cover"
                                                />
                                            </TouchableOpacity>
                                        );
                                    }

                                    if (type === 'video') {
                                        return (
                                            <TouchableOpacity
                                                key={String(a.id ?? idx)}
                                                style={styles.videoTile}
                                                activeOpacity={0.85}
                                                onPress={() => setMediaViewer({ type: 'video', uri: url })}
                                                accessibilityRole="button"
                                                accessibilityLabel="تشغيل الفيديو"
                                            >
                                                <Ionicons name="play-circle-outline" size={46} color="#FFF" />
                                            </TouchableOpacity>
                                        );
                                    }

                                    // Fallback for non-image/video attachments
                                    return (
                                        <TouchableOpacity
                                            key={String(a.id ?? idx)}
                                            style={styles.fileChip}
                                            activeOpacity={0.85}
                                            onPress={() => Linking.openURL(url)}
                                        >
                                            <Ionicons name="document-text-outline" size={18} color={isMine ? '#064E3B' : '#FFFFFF'} />
                                            <Text
                                                style={[
                                                    styles.fileChipText,
                                                    isMine ? styles.fileChipTextDark : styles.fileChipTextLight,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {a.original_name || 'ملف'}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : null}
                    </View>
                    <Text
                        style={[
                            styles.messageTime,
                            isMine ? styles.userMessageTime : styles.stylistMessageTime,
                        ]}
                    >
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                </View>
                {isMine &&
                    (selfImageUri ? (
                        <Image source={{ uri: selfImageUri }} style={styles.userAvatar} />
                    ) : (
                        <View style={[styles.userAvatar, styles.chatAvatarPlaceholderMine]}>
                            <Ionicons name="person" size={20} color="#064E3B" />
                        </View>
                    ))}
            </View>
        );
    };

    const handleSend = async () => {
        if (effectiveReadonly || !message.trim() || !conversationId || sending) return;

        setSending(true);
        const textToSend = message.trim();
        setMessage('');

        try {
            if (isStylist) {
                await apiService.sendStylistMessage(conversationId, textToSend);
            } else {
                await apiService.sendMessage(conversationId, textToSend);
            }
            await fetchMessages(); // Immediate refresh
            setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
        } catch (error) {
            console.error('Send message error:', error);
            setMessage(textToSend); // Restore message on failure
        } finally {
            setSending(false);
        }
    };

    const keyboardVerticalOffset =
        Platform.OS === 'ios' ? insets.top + 52 : Math.max(insets.top, 8);

    const openAttachMenu = () => {
        if (effectiveReadonly) return;
        Keyboard.dismiss();
        InteractionManager.runAfterInteractions(() => {
            setShowAttachMenu(true);
        });
    };

    return (
        <SafeAreaView
            style={[styles.container, isStylist ? stylistScreenDirection : userScreenDirection]}
            edges={['top', 'left', 'right']}
        >
            {/* Native full-screen window so it always stacks above the chat composer (fixes Android z-order). */}
            <Modal
                visible={showAttachMenu}
                transparent
                animationType="fade"
                {...(Platform.OS === 'ios' ? { presentationStyle: 'overFullScreen' as const } : {})}
                statusBarTranslucent
                navigationBarTranslucent
                onRequestClose={() => setShowAttachMenu(false)}
            >
                <View style={styles.attachModalRoot}>
                    <Pressable style={styles.attachModalBackdrop} onPress={() => setShowAttachMenu(false)} />
                    <View
                        style={[
                            styles.attachModalSheet,
                            { paddingBottom: Math.max(insets.bottom, 12) },
                        ]}
                    >
                        <View style={styles.attachMenuHeader}>
                            <TouchableOpacity
                                style={styles.attachCancelBtn}
                                onPress={() => setShowAttachMenu(false)}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <Ionicons name="close" size={22} color="#666" />
                                <Text style={styles.attachCancelText}>إلغاء</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.attachMenu}>
                            <TouchableOpacity
                                style={styles.attachOption}
                                onPress={handlePickGallery}
                                activeOpacity={0.85}
                            >
                                <View style={styles.attachIconContainer}>
                                    <View style={styles.attachIconGallery}>
                                        <Ionicons name="images" size={24} color="#FFF" />
                                    </View>
                                    <Text style={styles.attachOptionText}>صور وفيديو</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.attachOption}
                                onPress={handlePickDocument}
                                activeOpacity={0.85}
                            >
                                <View style={styles.attachIconContainer}>
                                    <View style={styles.attachIconFiles}>
                                        <Ionicons name="document-text" size={24} color="#FFF" />
                                    </View>
                                    <Text style={styles.attachOptionText}>ملفات</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={mediaViewer !== null}
                animationType="fade"
                transparent={false}
                presentationStyle={Platform.OS === 'ios' ? 'fullScreen' : undefined}
                statusBarTranslucent
                onRequestClose={closeMediaViewer}
            >
                <View style={styles.mediaViewerRoot}>
                    <View style={[styles.mediaViewerHeader, { paddingTop: Math.max(insets.top, 12) }]}>
                        <TouchableOpacity
                            onPress={closeMediaViewer}
                            style={styles.mediaViewerCloseBtn}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            accessibilityRole="button"
                            accessibilityLabel="إغلاق"
                        >
                            <Ionicons name="close" size={30} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    {mediaViewer?.type === 'image' ? (
                        <Pressable style={styles.mediaViewerImageArea} onPress={closeMediaViewer}>
                            <Image
                                source={{ uri: mediaViewer.uri }}
                                style={styles.mediaViewerImage}
                                resizeMode="contain"
                            />
                        </Pressable>
                    ) : mediaViewer?.type === 'video' ? (
                        <View style={styles.mediaViewerVideoArea}>
                            <Video
                                ref={(r) => {
                                    mediaVideoRef.current = r;
                                }}
                                style={styles.mediaViewerVideo}
                                source={{ uri: mediaViewer.uri }}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                shouldPlay
                                isLooping={false}
                            />
                        </View>
                    ) : null}
                </View>
            </Modal>

            <KeyboardAvoidingView
                style={styles.keyboardOuter}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={keyboardVerticalOffset}
                enabled={!showAttachMenu && !effectiveReadonly && mediaViewer === null}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name={getBackChevron()} size={24} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleBlock}>
                        <Text style={styles.headerName}>
                            {isStylist
                                ? (peerClient?.name || peerNameFromRoute || 'عميل')
                                : (stylist?.name || peerNameFromRoute || 'منسّق')}
                        </Text>
                        {effectiveReadonly ? (
                            <Text style={styles.headerReadonlyHint}>عرض السجل فقط — لا يمكن الإرسال</Text>
                        ) : null}
                    </View>
                    <View style={styles.headerSideSpacer} />
                </View>

                {(relatedOrderId || contextOrderId) ? (
                    <TouchableOpacity
                        style={styles.orderContextBar}
                        onPress={() =>
                            router.push(
                                `/pages/order_details?id=${relatedOrderId ?? contextOrderId}` as any
                            )
                        }
                        activeOpacity={0.88}
                    >
                        <Ionicons name="receipt-outline" size={18} color="#064E3B" />
                        <Text style={styles.orderContextText} numberOfLines={1}>
                            الطلب المرتبط بهذه المحادثة — عرض التفاصيل والدعم
                        </Text>
                        <Ionicons name={getForwardChevron()} size={18} color="#064E3B" />
                    </TouchableOpacity>
                ) : null}

                <View style={styles.messagesWrap}>
                    {loading ? (
                        <ChatThreadSkeleton />
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            style={styles.messagesList}
                            data={messages}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => <MessageItem item={item} />}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="interactive"
                            onScrollToIndexFailed={(info) => {
                                const wait = new Promise((r) => setTimeout(r, 100));
                                wait.then(() => {
                                    flatListRef.current?.scrollToIndex({
                                        index: info.index,
                                        animated: true,
                                        viewPosition: 0.4,
                                    });
                                });
                            }}
                            onContentSizeChange={() => {
                                if (!allowAutoScrollToEnd) return;
                                flatListRef.current?.scrollToEnd({ animated: false });
                            }}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>
                                        {effectiveReadonly ? 'لا توجد رسائل في السجل' : 'ابدأ المحادثة الآن'}
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>

                {/* Composer hidden while attachment Modal is open (native layer cannot overlap Modal). */}
                {effectiveReadonly ? (
                    <View
                        style={[styles.readonlyBanner, { paddingBottom: Math.max(insets.bottom, 12) }]}
                    >
                        <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                        <Text style={styles.readonlyBannerText}>
                            الطلب مكتمل أو غير نشط — لا يمكن إرسال رسائل جديدة. يمكنك قراءة سجل المحادثة أعلاه.
                        </Text>
                    </View>
                ) : !showAttachMenu ? (
                    <View
                        style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}
                        collapsable={false}
                    >
                        <TouchableOpacity style={styles.attachButton} onPress={openAttachMenu}>
                            <Ionicons name="attach-outline" size={24} color="#666" />
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="اكتب الرسالة هنا..."
                            placeholderTextColor="#999"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            editable={!sending}
                        />

                        <TouchableOpacity
                            style={[styles.sendButton, (sending || !message.trim()) && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={sending || !message.trim()}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Ionicons name="send" size={22} color="#FFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View
                        style={[styles.composerPlaceholder, { height: COMPOSER_MIN_HEIGHT + Math.max(insets.bottom, 8) }]}
                        pointerEvents="none"
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    keyboardOuter: {
        flex: 1,
    },
    messagesWrap: {
        flex: 1,
        position: 'relative',
    },
    messagesList: {
        flex: 1,
    },
    attachModalRoot: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    attachModalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    attachModalSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 24,
    },
    composerPlaceholder: {
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    attachMenuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 4,
    },
    attachCancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    attachCancelText: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
        ...rtlText.alignStart,
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
    headerTitleBlock: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    headerName: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
    },
    headerReadonlyHint: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 2,
    },
    readonlyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingTop: 12,
        backgroundColor: '#F3F4F6',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    readonlyBannerText: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#4B5563',
        ...rtlText.alignStart,
    },
    listContent: {
        padding: 15,
        paddingBottom: 20,
    },
    /** LTR row so "me" stays physical right regardless of app RTL (forceRTL / direction on root). */
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        width: '100%',
        alignItems: 'flex-end',
        direction: 'ltr',
    },
    messageHighlighted: {
        backgroundColor: 'rgba(6, 78, 59, 0.08)',
        borderRadius: 12,
        marginHorizontal: -4,
        paddingHorizontal: 4,
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
        marginEnd: 10,
    },
    stylistWrapper: {
        alignItems: 'flex-start',
        marginStart: 10,
    },
    messageBubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        direction: 'rtl',
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
        textAlign: 'right',
    },
    userText: {
        color: '#333',
    },
    stylistText: {
        color: '#FFF',
    },
    messageTime: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        marginTop: 4,
        writingDirection: 'ltr',
    },
    userMessageTime: {
        alignSelf: 'flex-end',
    },
    stylistMessageTime: {
        alignSelf: 'flex-start',
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
    chatAvatarPlaceholder: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    chatAvatarPlaceholderMine: {
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
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
        ...rtlText.alignStart,
    },
    attachmentsWrap: {
        marginTop: 10,
        gap: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    attachmentImage: {
        width: 200,
        height: 140,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    videoTile: {
        width: 200,
        height: 140,
        borderRadius: 12,
        backgroundColor: '#0F766E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.12)',
        maxWidth: 240,
    },
    fileChipText: {
        fontSize: 12,
        fontFamily: 'Cairo_600SemiBold',
    },
    fileChipTextDark: {
        color: '#064E3B',
    },
    fileChipTextLight: {
        color: '#FFF',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    attachMenu: {
        backgroundColor: '#F8FAF9',
        marginHorizontal: 8,
        marginBottom: 8,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderWidth: 1,
        borderColor: '#E8EFEC',
    },
    attachOption: {
        alignItems: 'center',
        minWidth: 100,
    },
    attachIconContainer: {
        alignItems: 'center',
    },
    attachIconGallery: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0D9488',
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
        marginTop: 8,
        ...rtlText.alignStart,
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
        direction: 'rtl',
        ...rtlText.alignStart,
    },
    sendButton: {
        marginStart: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#064E3B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSideSpacer: {
        width: 40,
        height: 40,
    },
    orderContextBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: '#F0FDF4',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#BBF7D0',
    },
    orderContextText: {
        flex: 1,
        fontSize: 12,
        fontFamily: 'Cairo_600SemiBold',
        color: '#064E3B',
        ...rtlText.alignStart,
    },
    mediaViewerRoot: {
        flex: 1,
        backgroundColor: '#000',
    },
    mediaViewerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 12,
        paddingBottom: 8,
    },
    mediaViewerCloseBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaViewerImageArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaViewerImage: {
        width: SCREEN_W,
        height: SCREEN_H * 0.82,
    },
    mediaViewerVideoArea: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingBottom: 24,
    },
    mediaViewerVideo: {
        width: '100%',
        flex: 1,
        minHeight: 220,
    },
});
