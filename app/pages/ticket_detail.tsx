import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Pressable,
  Linking,
  Keyboard,
  InteractionManager,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection, stylistScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import { useAuth } from '@/config/authContext';
import { isStylistUser } from '@/config/navigationFlow';
import { apiService, TicketDetail, TicketMessage } from '@/config/apiService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { resolveMediaUrl as resolveMediaUrlUtil } from '@/utils/resolveMediaUrl';
import { Video, ResizeMode } from 'expo-av';

const COMPOSER_MIN = 64;

type Att = { id?: number | string; type?: string; url?: string; original_name?: string };

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function resolveAttachmentUrl(url: string | undefined): string {
  return resolveMediaUrlUtil(url) ?? '';
}

function normalizeMessages(raw: unknown): TicketMessage[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as TicketMessage[];
  if (typeof raw === 'object' && raw !== null && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: TicketMessage[] }).data;
  }
  return [];
}

function AttachmentGrid({
  items,
  isOnDark,
  onOpenMedia,
}: {
  items: Att[];
  isOnDark?: boolean;
  onOpenMedia?: (m: { type: 'image' | 'video'; uri: string }) => void;
}) {
  if (!items?.length) return null;
  return (
    <View style={styles.attGrid}>
      {items.map((a, idx) => {
        const uri = resolveAttachmentUrl(a.url);
        const t = String(a.type ?? 'file');
        if (!uri) return null;
        if (t === 'image') {
          return (
            <TouchableOpacity
              key={`${a.id ?? idx}`}
              activeOpacity={0.9}
              onPress={() => (onOpenMedia ? onOpenMedia({ type: 'image', uri }) : Linking.openURL(uri))}
              accessibilityRole="button"
              accessibilityLabel="عرض الصورة بالحجم الكامل"
            >
              <Image source={{ uri }} style={styles.attImage} resizeMode="cover" />
            </TouchableOpacity>
          );
        }
        if (t === 'video') {
          return (
            <TouchableOpacity
              key={`${a.id ?? idx}`}
              style={styles.videoTile}
              onPress={() => (onOpenMedia ? onOpenMedia({ type: 'video', uri }) : Linking.openURL(uri))}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="تشغيل الفيديو"
            >
              <Ionicons name="play-circle" size={44} color="#FFF" />
              <Text style={styles.videoHint}>فيديو</Text>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity
            key={`${a.id ?? idx}`}
            style={[styles.fileChip, isOnDark && styles.fileChipDark]}
            onPress={() => Linking.openURL(uri)}
          >
            <Ionicons name="document-text-outline" size={18} color={isOnDark ? '#FFF' : '#064E3B'} />
            <Text style={[styles.fileChipText, isOnDark && styles.fileChipTextDark]} numberOfLines={1}>
              {a.original_name || 'ملف'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TicketDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isStylist = isStylistUser(user);
  const screenDir = isStylist ? stylistScreenDirection : userScreenDirection;

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{ type: 'image' | 'video'; uri: string } | null>(null);
  const mediaVideoRef = useRef<Video | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/pages/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!id) return;
    const silent = opts?.silent === true;
    if (!silent) setLoading(true);
    try {
      const res = await apiService.getTicket(id);
      const t = res?.data ?? null;
      setTicket(t);
    } catch {
      if (!silent) setTicket(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && id) load();
  }, [isAuthenticated, id, load]);

  const threadMessages = ticket ? normalizeMessages(ticket.messages) : [];
  const canReply = ticket && String(ticket.status ?? '').toLowerCase() !== 'closed';

  const ticketAttachments = useMemo(
    () => (Array.isArray((ticket as any)?.attachments) ? ((ticket as any).attachments as Att[]) : []),
    [ticket]
  );

  const pushNewMsgOrReload = useCallback(
    async (res: any) => {
      const raw = res?.data as TicketMessage | undefined;
      const newMsg = raw && typeof raw === 'object' && raw.id != null ? (raw as TicketMessage) : null;
      if (newMsg) {
        setTicket((prev) => {
          if (!prev) return prev;
          const existing = normalizeMessages(prev.messages);
          return { ...prev, messages: [...existing, newMsg] };
        });
        requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
        return;
      }
      await load({ silent: true });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    },
    [load]
  );

  const onSend = async () => {
    if (!id || !canReply || sending) return;
    const text = reply.trim();
    if (!text) return;

    setSending(true);
    try {
      const res = await apiService.replyToTicket(id, text);
      setReply('');
      await pushNewMsgOrReload(res);
    } catch {
      /* axios toast */
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

  const pickGallery = async () => {
    if (!id || !canReply || sending) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      const isVideo =
        a.type === 'video' || (a.mimeType != null && String(a.mimeType).startsWith('video/'));
      const name = a.fileName || (isVideo ? 'video.mp4' : 'photo.jpg');
      const mime = a.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg');
      setShowAttachMenu(false);
      setSending(true);
      try {
        const text = reply.trim();
        const res = await apiService.replyToTicket(id, text, [{ uri: a.uri, name, type: mime }]);
        setReply('');
        await pushNewMsgOrReload(res);
      } catch {
        /* axios toast */
      } finally {
        setSending(false);
      }
      return;
    }
    setShowAttachMenu(false);
  };

  const pickDocument = async () => {
    if (!id || !canReply || sending) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (!result.canceled && result.assets[0]) {
        const a = result.assets[0];
        setShowAttachMenu(false);
        setSending(true);
        try {
          const text = reply.trim();
          const res = await apiService.replyToTicket(id, text, [
            { uri: a.uri, name: a.name, type: a.mimeType || 'application/octet-stream' },
          ]);
          setReply('');
          await pushNewMsgOrReload(res);
        } catch {
          /* axios toast */
        } finally {
          setSending(false);
        }
        return;
      }
    } catch {
      /* noop */
    }
    setShowAttachMenu(false);
  };

  const openAttachMenu = () => {
    Keyboard.dismiss();
    InteractionManager.runAfterInteractions(() => setShowAttachMenu(true));
  };

  const renderMessage = ({ item }: { item: TicketMessage }) => {
    const fromUser = item.sender_type === 'user';
    const atts = Array.isArray((item as any).attachments) ? ((item as any).attachments as Att[]) : [];

    return (
      <View style={[styles.msgRow, fromUser ? styles.rowUser : styles.rowSupport]}>
        {!fromUser ? (
          <View style={[styles.avatar, styles.supportAvatarPlaceholder]}>
            <Ionicons name="headset-outline" size={20} color="#064E3B" />
          </View>
        ) : null}
        <View style={[styles.msgWrap, fromUser ? styles.wrapUser : styles.wrapSupport]}>
          <View style={[styles.bubble, fromUser ? styles.bubbleUser : styles.bubbleSupport]}>
            {!fromUser ? (
              <Text style={styles.supportName}>{item.sender_name ?? 'فريق الدعم'}</Text>
            ) : null}
            {item.body ? (
              <Text style={[styles.msgText, fromUser ? styles.textUser : styles.textSupport]}>{item.body}</Text>
            ) : null}
            <AttachmentGrid items={atts} isOnDark={!fromUser} onOpenMedia={setMediaViewer} />
          </View>
          <Text style={[styles.time, fromUser ? styles.timeUserPos : styles.timeSupportPos]}>
            {item.created_at
              ? new Date(item.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })
              : ''}
          </Text>
        </View>
        {fromUser ? (
          resolveMediaUrlUtil(user?.image as string | undefined) ? (
            <Image
              source={{ uri: resolveMediaUrlUtil(user?.image as string | undefined)! }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.userTicketAvatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#064E3B" />
            </View>
          )
        ) : null}
      </View>
    );
  };

  const keyboardOffset = Platform.OS === 'ios' ? insets.top + 52 : Math.max(insets.top, 8);

  const or = ticket?.order_report as
    | {
        id?: number;
        category_label?: string;
        status_label?: string;
        category?: string;
        status?: string;
      }
    | undefined;

  const ListHeader = () => {
    if (!ticket) return null;
    return (
      <View style={styles.headerBlock}>
        {or ? (
          <LinearGradient colors={['#ECFDF5', '#D1FAE5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.reportCard}>
            <View style={styles.reportCardTop}>
              <View style={styles.reportIconCircle}>
                <Ionicons name="document-text" size={22} color="#064E3B" />
              </View>
              <View style={styles.reportTitles}>
                <Text style={styles.reportKicker}>بلاغ طلب مرتبط</Text>
                <Text style={styles.reportHeadline}>هذه التذكرة مفتوحة من أجل متابعة بلاغك</Text>
              </View>
            </View>
            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <Text style={styles.chipLabel}>التصنيف</Text>
                <Text style={styles.chipValue}>{or.category_label ?? or.category ?? '—'}</Text>
              </View>
              <View style={[styles.chip, styles.chipMuted]}>
                <Text style={styles.chipLabel}>الحالة</Text>
                <Text style={styles.chipValue}>{or.status_label ?? or.status ?? '—'}</Text>
              </View>
            </View>
            {ticket.order?.id != null ? (
              <View style={styles.orderLine}>
                <Ionicons name="bag-handle-outline" size={16} color="#065F46" />
                <Text style={styles.orderLineText}>طلب رقم #{ticket.order.id}</Text>
              </View>
            ) : null}
          </LinearGradient>
        ) : null}

        <View style={[styles.msgRow, styles.rowUser]}>
          <View style={[styles.msgWrap, styles.wrapUser]}>
            <View style={[styles.bubble, styles.bubbleUser]}>
              <Text style={[styles.msgText, styles.textUser]}>{ticket.body}</Text>
              <AttachmentGrid items={ticketAttachments} onOpenMedia={setMediaViewer} />
            </View>
            <Text style={[styles.time, styles.timeUserPos]}>
              {ticket.created_at
                ? new Date(ticket.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })
                : ''}
            </Text>
          </View>
          {resolveMediaUrlUtil(user?.image as string | undefined) ? (
            <Image
              source={{ uri: resolveMediaUrlUtil(user?.image as string | undefined)! }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.userTicketAvatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#064E3B" />
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!id) {
    return (
      <SafeAreaView style={[styles.container, screenDir]}>
        <Text style={styles.muted}>تذكرة غير صالحة</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, screenDir]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
        enabled={!showAttachMenu && mediaViewer === null}
      >
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
                <Image source={{ uri: mediaViewer.uri }} style={styles.mediaViewerImage} resizeMode="contain" />
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

        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backHit} hitSlop={12}>
            <Ionicons name={getBackChevron()} size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.topTitle} numberOfLines={2}>
            {ticket?.subject ?? 'تذكرة الدعم'}
          </Text>
          <View style={styles.backHit} />
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#064E3B" />
          </View>
        ) : !ticket ? (
          <View style={styles.centered}>
            <Text style={styles.muted}>تعذر تحميل التذكرة</Text>
          </View>
        ) : (
          <>
            <View style={styles.messagesWrap}>
              <FlatList
                ref={flatListRef}
                data={threadMessages}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderMessage}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              />
            </View>

            <Modal
              visible={showAttachMenu}
              transparent
              animationType="fade"
              {...(Platform.OS === 'ios' ? { presentationStyle: 'overFullScreen' as const } : {})}
              onRequestClose={() => setShowAttachMenu(false)}
            >
              <View style={styles.modalRoot}>
                <Pressable style={styles.modalBackdrop} onPress={() => setShowAttachMenu(false)} />
                <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAttachMenu(false)} hitSlop={12}>
                      <Ionicons name="close" size={22} color="#666" />
                      <Text style={styles.modalCancelText}>إلغاء</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.attachMenu}>
                    <TouchableOpacity style={styles.attachOpt} onPress={pickGallery} activeOpacity={0.85}>
                      <View style={styles.attachIconPhotos}>
                        <Ionicons name="images" size={24} color="#FFF" />
                      </View>
                      <Text style={styles.attachOptText}>صور وفيديو</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachOpt} onPress={pickDocument} activeOpacity={0.85}>
                      <View style={styles.attachIconFiles}>
                        <Ionicons name="document-text" size={24} color="#FFF" />
                      </View>
                      <Text style={styles.attachOptText}>ملف</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {canReply ? (
              !showAttachMenu ? (
                <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 8) }]}>
                  <View style={styles.inputInner}>
                    <TouchableOpacity style={styles.attachBtn} onPress={openAttachMenu}>
                      <Ionicons name="attach-outline" size={24} color="#666" />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.input}
                      placeholder="اكتب رسالتك..."
                      placeholderTextColor="#999"
                      value={reply}
                      onChangeText={setReply}
                      multiline
                      editable={!sending}
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendBtn,
                        (!reply.trim() || sending) && styles.sendBtnOff,
                      ]}
                      onPress={onSend}
                      disabled={!reply.trim() || sending}
                    >
                      {sending ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Ionicons name="send" size={22} color="#FFF" style={styles.sendIconFlip} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={[styles.composerPlaceholder, { height: COMPOSER_MIN + Math.max(insets.bottom, 8) }]} />
              )
            ) : (
              <View style={styles.closedBar}>
                <Text style={styles.closedText}>هذه التذكرة مغلقة ولا يمكن الرد عليها.</Text>
              </View>
            )}
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FFF' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  backHit: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  topTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Cairo_700Bold',
    color: '#000',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { color: '#6B7280', fontFamily: 'Cairo_400Regular' },
  messagesWrap: { flex: 1 },
  listContent: { padding: 15, paddingBottom: 24 },
  headerBlock: { marginBottom: 8 },
  reportCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  reportCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  reportIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  reportTitles: { flex: 1, minWidth: 0 },
  reportKicker: {
    fontSize: 12,
    fontFamily: 'Cairo_600SemiBold',
    color: '#047857',
    marginBottom: 4,
    ...rtlText.alignStart,
  },
  reportHeadline: {
    fontSize: 15,
    fontFamily: 'Cairo_700Bold',
    color: '#064E3B',
    lineHeight: 22,
    ...rtlText.alignStart,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6EE7B7',
    minWidth: '42%',
    flexGrow: 1,
  },
  chipMuted: { borderColor: '#A7F3D0' },
  chipLabel: { fontSize: 11, color: '#047857', fontFamily: 'Cairo_400Regular', ...rtlText.alignStart },
  chipValue: { fontSize: 14, color: '#064E3B', fontFamily: 'Cairo_700Bold', ...rtlText.alignStart },
  orderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(6, 78, 59, 0.15)',
  },
  orderLineText: { fontSize: 13, fontFamily: 'Cairo_600SemiBold', color: '#065F46' },

  msgRow: {
    flexDirection: 'row',
    marginBottom: 18,
    width: '100%',
    alignItems: 'flex-end',
    direction: 'ltr',
  },
  rowUser: { justifyContent: 'flex-end' },
  rowSupport: { justifyContent: 'flex-start' },
  msgWrap: { maxWidth: '76%' },
  wrapUser: { alignItems: 'flex-end', marginEnd: 10 },
  wrapSupport: { alignItems: 'flex-start', marginStart: 10 },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    direction: 'rtl',
  },
  bubbleUser: {
    backgroundColor: '#E8F5E9',
    borderBottomRightRadius: 5,
  },
  bubbleSupport: {
    backgroundColor: '#064E3B',
    borderBottomLeftRadius: 5,
  },
  supportName: {
    fontSize: 12,
    fontFamily: 'Cairo_700Bold',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
    ...rtlText.alignStart,
  },
  msgText: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    lineHeight: 22,
    textAlign: 'right',
  },
  textUser: { color: '#333' },
  textSupport: { color: '#FFF' },
  time: {
    fontSize: 11,
    fontFamily: 'Cairo_400Regular',
    color: '#999',
    marginTop: 4,
    writingDirection: 'ltr',
  },
  timeUserPos: { alignSelf: 'flex-end' },
  timeSupportPos: { alignSelf: 'flex-start' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  supportAvatarPlaceholder: {
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  userTicketAvatarPlaceholder: {
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  attGrid: { marginTop: 8, gap: 8 },
  attImage: { width: 200, height: 150, borderRadius: 12, backgroundColor: '#F3F4F6' },
  videoTile: {
    width: 200,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoHint: { marginTop: 6, fontSize: 12, fontFamily: 'Cairo_600SemiBold', color: '#FFF' },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    maxWidth: 220,
  },
  fileChipDark: { backgroundColor: 'rgba(255,255,255,0.12)' },
  fileChipText: { flex: 1, fontSize: 12, fontFamily: 'Cairo_600SemiBold', color: '#064E3B' },
  fileChipTextDark: { color: '#FFF' },

  modalRoot: { flex: 1, backgroundColor: 'transparent' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
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
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  modalCancel: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  modalCancelText: { fontSize: 15, fontFamily: 'Cairo_700Bold', color: '#064E3B' },
  attachMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 40,
    backgroundColor: '#F8FAF9',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EFEC',
  },
  attachOpt: { alignItems: 'center' },
  attachIconPhotos: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachIconFiles: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachOptText: { marginTop: 8, fontSize: 13, fontFamily: 'Cairo_400Regular', color: '#333' },

  inputRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  attachBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
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
  sendBtn: {
    marginStart: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIconFlip: {
    transform: [{ scaleX: -1 }],
  },
  sendBtnOff: { opacity: 0.45 },
  composerPlaceholder: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  closedBar: { padding: 14, backgroundColor: '#F3F4F6', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  closedText: { textAlign: 'center', color: '#6B7280', fontFamily: 'Cairo_400Regular', fontSize: 14 },

  mediaViewerRoot: { flex: 1, backgroundColor: '#000' },
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
  mediaViewerImageArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mediaViewerImage: { width: SCREEN_W, height: SCREEN_H * 0.82 },
  mediaViewerVideoArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 8, paddingBottom: 24 },
  mediaViewerVideo: { width: '100%', flex: 1, minHeight: 220 },
});
