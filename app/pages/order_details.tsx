import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Pressable,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection, stylistScreenDirection } from '@/config/rtlLayout';
import { rtlInput, rtlText } from '@/config/rtlText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/config/authContext';
import { isStylistUser } from '@/config/navigationFlow';
import apiService, { Conversation, Order } from '@/config/apiService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrderReviewSheet } from '@/components/OrderReviewSheet';
import {
  StylistScreenHeader,
  STYLIST_GREEN as GREEN,
  STYLIST_GREEN_MUTED,
} from '@/components/StylistScreenHeader';
import { getBodyShapeImageSource, getSkinToneImageSource } from '@/utils/onboardingVisuals';
import { LinearGradient } from 'expo-linear-gradient';
import { format, isValid, parseISO } from 'date-fns';
import { ar as arLocale } from 'date-fns/locale';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, Shadows } from '@/utils/spacing';
import { FontSizes } from '@/utils/typography';
import SarPriceText from '@/components/SarPriceText';
import {
  pickResolvedEntityImageUrl,
  pickStylistHeroImageUrl,
  resolveMediaUrl,
} from '@/utils/resolveMediaUrl';
import { ChatLegalConsentModal } from '@/components/chat/ChatLegalConsentModal';
import { hasUserAcceptedChatLegal } from '@/utils/chatLegalConsent';

const SKIN_AR: Record<string, string> = {
  light: 'فاتحة جداً',
  fair: 'فاتحة',
  medium: 'متوسطة',
  tan: 'أسمر',
  dark: 'داكنة',
};

const BODY_SHAPE_AR: Record<string, string> = {
  hourglass: 'ساعة رملية',
  pear: 'كمثرى',
  apple: 'تفاحة',
  rectangle: 'مستطيل',
  inverted_triangle: 'مقلوبة',
};

const GENDER_AR: Record<string, string> = {
  male: 'ذكر',
  female: 'أنثى',
};

const REPORT_CATEGORIES: { key: string; label: string }[] = [
  { key: 'delay', label: 'تأخير' },
  { key: 'quality', label: 'جودة الخدمة' },
  { key: 'behavior', label: 'سلوك' },
  { key: 'payment', label: 'دفع' },
  { key: 'other', label: 'أخرى' },
];

const MEASUREMENT_LABELS: { key: string; label: string }[] = [
  { key: 'shoulder', label: 'الكتف' },
  { key: 'chest', label: 'الصدر' },
  { key: 'waist', label: 'الخصر' },
  { key: 'arm', label: 'الذراع' },
  { key: 'hip', label: 'المؤخرة' },
  { key: 'thigh', label: 'الفخذ' },
  { key: 'leg', label: 'الساق' },
];

function statusLabelAr(status?: string, payment?: string): string {
  const s = String(status || '').toLowerCase();
  if (s === 'completed') return 'مكتمل';
  if (s === 'cancelled') return 'ملغى';
  if (s === 'new') return payment === 'paid' ? 'جديدة (مدفوع)' : 'جديدة';
  if (s === 'in_progress') return 'قيد التنفيذ';
  return status || '—';
}

function statusColor(status?: string): string {
  const s = String(status || '').toLowerCase();
  if (s === 'completed') return '#10B981';
  if (s === 'cancelled') return '#EF4444';
  if (s === 'new') return '#F59E0B';
  if (s === 'in_progress') return '#2563EB';
  return '#9CA3AF';
}

function formatCreatedAtAr(raw?: string): string | null {
  if (!raw) return null;
  try {
    const d = parseISO(raw);
    if (!isValid(d)) return null;
    return format(d, 'd MMM yyyy · HH:mm', { locale: arLocale });
  } catch {
    return null;
  }
}

function paymentLabelAr(payment?: string): string {
  const p = String(payment || '').toLowerCase();
  if (p === 'paid') return 'مدفوع';
  if (p === 'pending') return 'في انتظار الدفع';
  if (p === 'failed') return 'فشل الدفع';
  return payment ? String(payment) : '';
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const isStylist = isStylistUser(user);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const reviewDismissed = useRef(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState('other');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);
  const [showChatLegalModal, setShowChatLegalModal] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      if (isStylist) {
        const res = await apiService.getStylistOrder(id);
        setOrder((res?.data as Order) ?? null);
      } else {
        const res = await apiService.getOrder(id);
        setOrder((res?.data as Order) ?? null);
      }
    } catch (e) {
      console.error(e);
      setOrder(null);
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404) {
        Alert.alert('تنبيه', 'تعذر فتح هذا الطلب. قد يكون غير موجود أو غير متاح.', [
          { text: 'حسناً', onPress: () => router.back() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [id, isStylist]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (
      !loading &&
      order &&
      !isStylist &&
      (order as Record<string, unknown>).can_review_stylist &&
      !reviewDismissed.current
    ) {
      setShowReviewSheet(true);
    }
  }, [loading, order, isStylist]);

  const o = order as Record<string, any> | null;
  const clientUser = o?.user;
  const service = o?.service;
  const stylist = o?.stylist;

  const status = String(o?.status || '').toLowerCase();
  const paymentStatus = String(o?.payment_status || '').toLowerCase();
  const isTerminal = status === 'completed' || status === 'cancelled';
  const isNew = status === 'new';
  const isPaid = paymentStatus === 'paid';
  const showAcceptReject = isNew && !isPaid;
  const showComplete = !isTerminal && isPaid;
  const hasStylistPeer = Boolean(o?.stylist_id || stylist?.id);
  const hasClientPeer = Boolean(clientUser?.id ?? o?.user_id);

  /** Send messages only when order is paid and still open (not completed/cancelled). */
  const canLiveChat = isPaid && !isTerminal && (isStylist ? hasClientPeer : hasStylistPeer);

  /** Read-only history when there is a peer but no paid ongoing thread (e.g. unpaid, completed, cancelled). */
  const canOpenChatHistory =
    (isStylist ? hasClientPeer : hasStylistPeer) && !canLiveChat;

  const executeStartChat = async () => {
    try {
      if (isStylist) {
        const uid = Number(clientUser?.id ?? o?.user_id);
        if (!uid) return;
        const res = await apiService.startStylistConversation(uid);
        const c = (res?.data as Record<string, unknown>) ?? res;
        const cid = c?.id;
        if (cid != null) router.push(`/pages/chat?id=${cid}` as any);
      } else {
        const sid = Number(o?.stylist_id ?? stylist?.id);
        if (!sid) return;
        const res = await apiService.startConversation(sid);
        const c = (res?.data as Record<string, unknown>) ?? res;
        const cid = c?.id;
        if (cid != null) router.push(`/pages/chat?id=${cid}` as any);
      }
    } catch {
      /* axios shows toast */
    }
  };

  const handleStartChat = async () => {
    if (!canLiveChat) {
      Alert.alert('تنبيه', 'المراسلة متاحة فقط عند وجود طلب مدفوع وقيد التنفيذ بينكما.');
      return;
    }
    if (!isStylist) {
      const accepted = await hasUserAcceptedChatLegal();
      if (!accepted) {
        setShowChatLegalModal(true);
        return;
      }
    }
    await executeStartChat();
  };

  const handleOpenChatHistory = async () => {
    const orderRouteId = id != null ? String(id) : '';
    const openReadonly = (conversationId: number | string, peerLabel?: string) => {
      const parts = [`id=${conversationId}`, 'readonly=1'];
      if (peerLabel) parts.push(`peerName=${encodeURIComponent(peerLabel)}`);
      if (orderRouteId) parts.push(`contextOrderId=${encodeURIComponent(orderRouteId)}`);
      router.push(`/pages/chat?${parts.join('&')}` as any);
    };

    const convFromOrder = (o as { conversation_id?: number | string | null })?.conversation_id;
    if (convFromOrder != null && String(convFromOrder) !== '') {
      openReadonly(
        convFromOrder,
        isStylist ? clientUser?.name || undefined : stylist?.name || undefined
      );
      return;
    }

    try {
      if (isStylist) {
        const uid = Number(clientUser?.id ?? o?.user_id);
        if (!uid) return;

        try {
          const listRes = await apiService.listStylistConversations({ skipErrorToast: true });
          const convs = Array.isArray(listRes?.data) ? listRes.data : [];
          const match = convs.find((c: Conversation) => {
            const pid = c.user?.id ?? c.user_id ?? (c as { client?: { id?: unknown } }).client?.id;
            return String(pid ?? '') === String(uid);
          });
          if (match?.id != null) {
            openReadonly(match.id, clientUser?.name || undefined);
            return;
          }
        } catch {
          /* fall through */
        }

        Alert.alert(
          'تعذر فتح المحادثة',
          'لم يُعثر على محادثة لهذا الطلب. افتح تبويب «المحادثات» من الشريط السفلي، أو حدّث تفاصيل الطلب بعد تحديث الخادم.',
          [{ text: 'حسناً' }]
        );
      } else {
        const sid = Number(o?.stylist_id ?? stylist?.id);
        if (!sid) return;

        try {
          const listRes = await apiService.listConversations({ skipErrorToast: true });
          const convs = Array.isArray(listRes?.data) ? listRes.data : [];
          const match = convs.find(
            (c: Conversation) => String(c.stylist?.id ?? c.stylist_id ?? '') === String(sid)
          );
          if (match?.id != null) {
            openReadonly(match.id, stylist?.name || undefined);
            return;
          }
        } catch {
          /* fall through */
        }

        Alert.alert(
          'تعذر فتح المحادثة',
          'لم يُعثر على محادثة لهذا الطلب. افتح تبويب «المحادثات» من الشريط السفلي، أو حدّث تفاصيل الطلب بعد تحديث الخادم.',
          [{ text: 'حسناً' }]
        );
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      if (typeof msg === 'string') Alert.alert('تنبيه', msg);
    }
  };

  const onAccept = async () => {
    if (!id) return;
    setActing(true);
    try {
      await apiService.acceptStylistOrder(id);
      await load();
    } finally {
      setActing(false);
    }
  };

  const onReject = async () => {
    Alert.alert('رفض الطلب', 'هل أنتِ متأكدة من رفض هذا الطلب؟', [
      { text: 'لا', style: 'cancel' },
      {
        text: 'رفض',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          setActing(true);
          try {
            await apiService.rejectStylistOrder(id);
            await load();
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  const onComplete = async () => {
    if (!id) return;
    setActing(true);
    try {
      await apiService.completeStylistOrder(id);
      await load();
    } finally {
      setActing(false);
    }
  };

  const canReport =
    o &&
    status !== 'cancelled' &&
    !(o as Record<string, unknown>).has_reported_order;

  const submitReport = async () => {
    if (!id || !canReport) return;
    setReporting(true);
    try {
      const res = isStylist
        ? await apiService.reportStylistOrder(id, {
            category: reportCategory,
            details: reportDetails.trim() || undefined,
          })
        : await apiService.reportOrder(id, {
            category: reportCategory,
            details: reportDetails.trim() || undefined,
          });
      const ticketId = res?.data?.ticket?.id;
      setShowReportModal(false);
      setReportDetails('');
      await load();
      if (ticketId != null) {
        Alert.alert('تم', 'تم إرسال البلاغ وربطه بتذكرة الدعم. يمكنك متابعة الرد على التذكرة.', [
          { text: 'لاحقاً', style: 'cancel' },
          {
            text: 'فتح التذكرة',
            onPress: () =>
              router.push({ pathname: '/pages/ticket_detail' as any, params: { id: String(ticketId) } }),
          },
        ]);
      } else {
        Alert.alert('تم', 'تم إرسال البلاغ للمراجعة.');
      }
    } catch {
      /* axios toast */
    } finally {
      setReporting(false);
    }
  };

  const renderReportModal = () => (
    <Modal visible={showReportModal} transparent animationType="fade" onRequestClose={() => setShowReportModal(false)}>
      <View style={styles.reportOverlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowReportModal(false)} />
        <View style={[styles.reportSheet, stylistScreenDirection]}>
          <Text style={styles.reportTitle}>الإبلاغ عن الطلب</Text>
          <Text style={styles.reportHint}>اختر السبب (يمكنك إضافة تفاصيل)</Text>
          <View style={styles.reportCats}>
            {REPORT_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.reportChip, reportCategory === c.key && styles.reportChipOn]}
                onPress={() => setReportCategory(c.key)}
              >
                <Text style={[styles.reportChipText, reportCategory === c.key && styles.reportChipTextOn]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.reportInput}
            placeholder="تفاصيل إضافية..."
            placeholderTextColor="#9CA3AF"
            value={reportDetails}
            onChangeText={setReportDetails}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.btnPrimary, reporting && { opacity: 0.7 }]}
            onPress={submitReport}
            disabled={reporting}
          >
            {reporting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnPrimaryText}>إرسال البلاغ</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const screenDir = isStylist ? stylistScreenDirection : userScreenDirection;

  if (!id) {
    return (
      <SafeAreaView style={[styles.containerUser, screenDir]} edges={['top']}>
        <StylistScreenHeader title="تفاصيل الطلب" />
        <View style={[styles.centered, styles.fill]}>
          <Text style={styles.muted}>طلب غير صالح</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.containerUser, screenDir]} edges={['top']}>
        <StylistScreenHeader title="تفاصيل الطلب" />
        <View style={[styles.centered, styles.fill]}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order || !o) {
    return (
      <SafeAreaView style={[styles.containerUser, screenDir]} edges={['top']}>
        <StylistScreenHeader title="تفاصيل الطلب" />
        <View style={[styles.centered, styles.fill, styles.errorPad]}>
          <Ionicons name="alert-circle-outline" size={48} color="#CBD5E1" />
          <Text style={styles.muted}>تعذر تحميل الطلب</Text>
        </View>
      </SafeAreaView>
    );
  }

  const priceValue =
    o.total != null ? o.total : service?.price != null ? service.price : null;

  const createdAtStr = formatCreatedAtAr(
    typeof o.created_at === 'string' ? o.created_at : typeof o.createdAt === 'string' ? o.createdAt : undefined
  );

  const serviceTitle = service?.title || `طلب #${o.id}`;
  const clientName = clientUser?.name || 'العميل';
  const clientImage = resolveMediaUrl(clientUser?.image as string | undefined);
  const clientGender = clientUser?.gender as string | undefined;

  const clientInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderDetailRow = (label: string, value: string | null | undefined) => {
    if (value == null || value === '') return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  const renderVisualDetailRow = (
    label: string,
    caption: string | null | undefined,
    imageSource: ImageSourcePropType | null
  ) => {
    if (!caption && !imageSource) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <View style={styles.detailVisualEnd}>
          {imageSource ? (
            <Image source={imageSource} style={styles.onboardingThumb} resizeMode="contain" />
          ) : null}
          {caption ? <Text style={styles.detailCaption}>{caption}</Text> : null}
        </View>
      </View>
    );
  };

  const skinToneKey = String(clientUser?.skin_tones ?? '')
    .toLowerCase()
    .trim();
  const bodyShapeKey = String(clientUser?.body_shape ?? '')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');
  const skinAr = skinToneKey
    ? SKIN_AR[skinToneKey] || String(clientUser.skin_tones)
    : null;
  const shapeAr = bodyShapeKey
    ? BODY_SHAPE_AR[bodyShapeKey] || String(clientUser.body_shape)
    : null;
  const skinImg = getSkinToneImageSource(skinToneKey || clientUser?.skin_tones, clientGender);
  const shapeImg = getBodyShapeImageSource(bodyShapeKey || clientUser?.body_shape, clientGender);

  const rawMeasurements = (clientUser?.body_measurements || {}) as Record<string, unknown>;
  const measurementsSkipped =
    rawMeasurements.skipped === true ||
    rawMeasurements.skipped === 1 ||
    String(rawMeasurements.skipped) === 'true';
  const measurements: Record<string, number | string> = {};
  for (const [k, v] of Object.entries(rawMeasurements)) {
    if (k === 'skipped') continue;
    if (v != null && v !== '') measurements[k] = v as number | string;
  }
  const hasAnyMeasurement = MEASUREMENT_LABELS.some(
    ({ key }) => measurements[key] != null && measurements[key] !== ''
  );

  const fashionStyleItems = (clientUser?.fashion_style_items ?? []) as {
    id?: number | string;
    name?: string;
    image_url?: string;
    image?: string;
  }[];

  if (isStylist) {
    return (
      <SafeAreaView style={[styles.containerStylist, screenDir]} edges={['top']}>
        <StylistScreenHeader title="تفاصيل الطلب" />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[GREEN, '#047857', '#0D9488']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroInner}>
              {clientImage ? (
                <Image source={{ uri: clientImage }} style={styles.avatarLg} />
              ) : (
                <View style={[styles.avatarLg, styles.avatarLgPlaceholder]}>
                  <Text style={styles.avatarInitials}>{clientInitials(clientName)}</Text>
                </View>
              )}
              <View style={styles.greenTextCol}>
                <View style={styles.heroTitleRow}>
                  <Text style={styles.clientName} numberOfLines={2}>
                    {clientName}
                  </Text>
                  <View style={[styles.heroStatusPill, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                    <Text style={[styles.heroStatusText, { color: '#FFF' }]}>
                      {statusLabelAr(status, paymentStatus)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.serviceLine} numberOfLines={2}>
                  {serviceTitle}
                </Text>
                <Text style={styles.orderMetaLight} numberOfLines={1}>
                  طلب #{o.id}
                  {createdAtStr ? ` · ${createdAtStr}` : ''}
                </Text>
                {paymentStatus ? (
                  <View style={styles.paymentRowStylist}>
                    <Ionicons name="card-outline" size={14} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.paymentRowText}>{paymentLabelAr(paymentStatus)}</Text>
                  </View>
                ) : null}
                <SarPriceText value={priceValue} textStyle={styles.priceLine} symbolSize={22} />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.whiteCard}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionIconWrap}>
                <Ionicons name="body-outline" size={18} color={GREEN} />
              </View>
              <Text style={styles.sectionTitle}>البيانات والقياسات</Text>
            </View>
            {renderDetailRow('البريد', clientUser?.email ? String(clientUser.email) : null)}
            {renderDetailRow('الجوال', clientUser?.phone ? String(clientUser.phone) : null)}
            {renderDetailRow(
              'الجنس',
              clientGender ? GENDER_AR[String(clientGender).toLowerCase()] || String(clientGender) : null
            )}
            {renderDetailRow('الطول', clientUser?.height != null ? `${clientUser.height} cm` : null)}
            {renderDetailRow('الوزن', clientUser?.weight != null ? `${clientUser.weight} kg` : null)}
            {renderVisualDetailRow('درجة البشرة', skinAr, skinImg)}
            {renderVisualDetailRow('قوام الجسم', shapeAr, shapeImg)}
            <View style={styles.divider} />
            {measurementsSkipped ? (
              <Text style={styles.measurementsSkippedNote}>تخطّى العميل إدخال القياسات</Text>
            ) : hasAnyMeasurement ? (
              MEASUREMENT_LABELS.map(({ key: mKey, label }) =>
                measurements[mKey] != null && measurements[mKey] !== '' ? (
                  <React.Fragment key={mKey}>{renderDetailRow(label, `${measurements[mKey]} cm`)}</React.Fragment>
                ) : null
              )
            ) : (
              <Text style={styles.measurementsSkippedNote}>لا توجد قياسات محفوظة</Text>
            )}
            {fashionStyleItems.length > 0 ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.subsectionLabel}>تفضيلات الأسلوب</Text>
                <View style={styles.stylePrefsWrap}>
                  {fashionStyleItems.map((item, idx) => {
                    const uri = resolveMediaUrl(
                      (item.image_url as string | undefined) || (item.image as string | undefined)
                    );
                    const sid = `style-${String(item.id ?? 'n')}-${idx}`;
                    return (
                      <View key={sid} style={styles.stylePrefChip}>
                        {uri ? (
                          <Image source={{ uri }} style={styles.stylePrefImg} />
                        ) : (
                          <View style={[styles.stylePrefImg, styles.stylePrefImgPh]}>
                            <Text style={styles.stylePrefPhTxt} numberOfLines={1}>
                              {(item.name || '?').slice(0, 2)}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.stylePrefName} numberOfLines={2}>
                          {item.name || '—'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : null}
            {o.notes ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.notesLabel}>ملاحظات</Text>
                <Text style={styles.notesBody}>{String(o.notes)}</Text>
              </>
            ) : null}
          </View>
        </ScrollView>

        <View style={[styles.footer, styles.footerElevated, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {isTerminal ? (
            <View style={[styles.terminalBanner, status === 'completed' ? styles.terminalOk : styles.terminalBad]}>
              <Text style={styles.terminalText}>
                {status === 'completed' ? 'تم إتمام هذا الطلب' : 'تم إلغاء هذا الطلب'}
              </Text>
            </View>
          ) : null}

          {showAcceptReject ? (
            <View style={styles.row2}>
              <TouchableOpacity style={[styles.btnOutline, styles.btnHalf]} onPress={onReject} disabled={acting}>
                <Text style={styles.btnOutlineText}>رفض الطلب</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, styles.btnHalf]} onPress={onAccept} disabled={acting}>
                {acting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryText}>قبول الطلب</Text>}
              </TouchableOpacity>
            </View>
          ) : null}

          {showComplete ? (
            <TouchableOpacity
              style={[styles.btnPrimary, styles.btnFull, { marginTop: showAcceptReject ? 10 : 0 }]}
              onPress={onComplete}
              disabled={acting}
            >
              {acting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnPrimaryText}>إتمام الطلب</Text>}
            </TouchableOpacity>
          ) : null}

          {canLiveChat ? (
            <TouchableOpacity style={[styles.btnChat, styles.btnFull]} onPress={handleStartChat}>
              <Ionicons name="chatbubbles-outline" size={20} color={GREEN} />
              <Text style={styles.btnChatText}>مراسلة العميل</Text>
            </TouchableOpacity>
          ) : null}
          {canOpenChatHistory ? (
            <TouchableOpacity
              style={[styles.btnChatHistory, styles.btnFull, { marginTop: canLiveChat ? 10 : 0 }]}
              onPress={handleOpenChatHistory}
            >
              <Ionicons name="time-outline" size={20} color="#4B5563" />
              <Text style={styles.btnChatHistoryText}>عرض سجل المحادثة</Text>
            </TouchableOpacity>
          ) : null}

          {canReport ? (
            <TouchableOpacity
              style={[styles.btnReport, styles.btnFull, { marginTop: 10 }]}
              onPress={() => setShowReportModal(true)}
            >
              <Ionicons name="flag-outline" size={20} color="#B91C1C" />
              <Text style={styles.btnReportText}>الإبلاغ عن هذا الطلب</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {renderReportModal()}
      </SafeAreaView>
    );
  }

  const userHeroServiceUri = resolveMediaUrl(service?.image as string | undefined);
  const userHeroStylistCoverOrProfile =
    pickStylistHeroImageUrl(stylist as Record<string, unknown>) ??
    pickResolvedEntityImageUrl(stylist as any);
  const userHeroStylistAvatarUri = pickResolvedEntityImageUrl(stylist as any);
  const userHeroLargeUri = userHeroServiceUri ?? userHeroStylistCoverOrProfile;

  return (
    <SafeAreaView style={[styles.containerUser, screenDir]} edges={['top']}>
      <StylistScreenHeader title="تفاصيل الطلب" />

      <ScrollView contentContainerStyle={styles.scrollContentUser} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#FFFFFF', STYLIST_GREEN_MUTED]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userHeroCard}
        >
          <View style={styles.userHeroTop}>
            {userHeroLargeUri ? (
              <Image source={{ uri: userHeroLargeUri }} style={styles.userServiceThumb} />
            ) : (
              <View style={styles.userServiceThumbPlaceholder}>
                <Ionicons name="bag-handle-outline" size={scale(28)} color={GREEN} />
              </View>
            )}
            <View style={styles.userHeroTextCol}>
              <Text style={styles.userServiceTitle}>{serviceTitle}</Text>
              <View style={styles.stylistRow}>
                {userHeroStylistAvatarUri ? (
                  <Image source={{ uri: userHeroStylistAvatarUri }} style={styles.stylistMini} />
                ) : (
                  <View style={styles.stylistMiniPh}>
                    <Ionicons name="person-outline" size={14} color={GREEN} />
                  </View>
                )}
                <Text style={styles.userStylistName} numberOfLines={1}>
                  {stylist?.name || 'المنسّق'}
                </Text>
              </View>
              <SarPriceText value={priceValue} textStyle={styles.userPrice} symbolSize={22} />
              <View style={styles.chipRow}>
                <View style={[styles.statusChip, { backgroundColor: statusColor(status) + '22' }]}>
                  <Text style={[styles.statusChipText, { color: statusColor(status) }]}>
                    {statusLabelAr(status, paymentStatus)}
                  </Text>
                </View>
                {paymentStatus ? (
                  <View
                    style={[
                      styles.payChip,
                      paymentStatus === 'paid' ? styles.payChipOk : styles.payChipWait,
                    ]}
                  >
                    <Text
                      style={[
                        styles.payChipText,
                        paymentStatus === 'paid' ? styles.payChipTextOk : styles.payChipTextWait,
                      ]}
                    >
                      {paymentLabelAr(paymentStatus)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
          <Text style={styles.userOrderMeta} numberOfLines={2}>
            طلب #{o.id}
            {createdAtStr ? ` · ${createdAtStr}` : ''}
          </Text>
          {paymentStatus === 'pending' && !isTerminal ? (
            <View style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={18} color="#B45309" />
              <Text style={styles.hint}>
                أكمل الدفع لتفعيل المراسلة المباشرة مع المنسّق. يمكنك عرض سجل الرسائل السابقة من الزر أدناه إن
                وُجد.
              </Text>
            </View>
          ) : null}
        </LinearGradient>
      </ScrollView>

      <View style={[styles.footerUser, styles.footerElevated, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {isTerminal ? (
          <View style={[styles.terminalBanner, status === 'completed' ? styles.terminalOk : styles.terminalBad]}>
            <Text style={styles.terminalText}>{status === 'completed' ? 'تم إتمام الطلب' : 'تم إلغاء الطلب'}</Text>
          </View>
        ) : null}
        {!isTerminal && paymentStatus === 'pending' ? (
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push(`/pages/payment/cards?order_id=${o.id}` as any)}
          >
            <Text style={styles.btnPrimaryText}>الدفع الآن</Text>
          </TouchableOpacity>
        ) : null}
        {canLiveChat ? (
          <TouchableOpacity style={[styles.btnChat, { marginTop: 10 }]} onPress={handleStartChat}>
            <Ionicons name="chatbubbles-outline" size={20} color={GREEN} />
            <Text style={styles.btnChatText}>مراسلة المنسّق</Text>
          </TouchableOpacity>
        ) : null}
        {canOpenChatHistory ? (
          <TouchableOpacity
            style={[styles.btnChatHistory, { marginTop: canLiveChat ? 10 : 10 }]}
            onPress={handleOpenChatHistory}
          >
            <Ionicons name="time-outline" size={20} color="#4B5563" />
            <Text style={styles.btnChatHistoryText}>عرض سجل المحادثة</Text>
          </TouchableOpacity>
        ) : null}

        {canReport ? (
          <TouchableOpacity
            style={[styles.btnReport, { marginTop: 10 }]}
            onPress={() => setShowReportModal(true)}
          >
            <Ionicons name="flag-outline" size={20} color="#B91C1C" />
            <Text style={styles.btnReportText}>الإبلاغ عن هذا الطلب</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <OrderReviewSheet
        visible={showReviewSheet}
        stylistId={Number(o?.stylist_id ?? stylist?.id)}
        stylistName={stylist?.name}
        onClose={() => {
          reviewDismissed.current = true;
          setShowReviewSheet(false);
        }}
        onSubmitted={() => load()}
      />
      <ChatLegalConsentModal
        visible={showChatLegalModal}
        onClose={() => setShowChatLegalModal(false)}
        onAccepted={executeStartChat}
      />
      {renderReportModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerStylist: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  containerUser: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  fill: { flex: 1 },
  errorPad: { paddingHorizontal: Spacing.lg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  muted: {
    fontFamily: 'Cairo_400Regular',
    fontSize: FontSizes.body,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingTop: Spacing.verticalMd,
    paddingBottom: Spacing.xxl,
  },
  heroGradient: {
    borderRadius: BorderRadius.card,
    padding: Spacing.cardPadding,
    ...Shadows.medium,
    shadowOpacity: 0.14,
    elevation: 8,
  },
  heroInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  heroStatusPill: {
    paddingHorizontal: scale(10),
    paddingVertical: scaleVertical(4),
    borderRadius: BorderRadius.badge,
    maxWidth: '48%',
  },
  heroStatusText: {
    fontFamily: 'Cairo_700Bold',
    fontSize: scale(11),
    ...rtlText.alignStart,
  },
  orderMetaLight: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: 'Cairo_400Regular',
    fontSize: FontSizes.bodySmall,
    marginTop: Spacing.verticalXs,
    ...rtlText.alignStart,
  },
  paymentRowStylist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.verticalXs,
  },
  paymentRowText: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: 'Cairo_600SemiBold',
    fontSize: scale(12),
    ...rtlText.alignStart,
  },
  avatarLg: {
    width: scale(78),
    height: scale(78),
    borderRadius: scale(39),
    marginEnd: Spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarLgPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarInitials: {
    color: '#FFF',
    fontFamily: 'Cairo_700Bold',
    fontSize: scale(22),
  },
  greenTextCol: { flex: 1, minWidth: 0 },
  clientName: {
    color: '#FFF',
    fontFamily: 'Cairo_700Bold',
    fontSize: scale(17),
    flex: 1,
    minWidth: 0,
    ...rtlText.alignStart,
  },
  serviceLine: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: 'Cairo_400Regular',
    fontSize: FontSizes.body,
    marginTop: Spacing.verticalXs,
    ...rtlText.alignStart,
  },
  priceLine: {
    color: '#FFF',
    fontFamily: 'Cairo_700Bold',
    fontSize: FontSizes.bodyLarge,
    marginTop: Spacing.verticalSm,
    writingDirection: 'ltr',
    ...rtlText.alignStart,
  },
  whiteCard: {
    backgroundColor: '#FFF',
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.card,
    padding: Spacing.cardPadding,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    ...Shadows.medium,
    shadowOpacity: 0.08,
    elevation: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionIconWrap: {
    width: scale(36),
    height: scale(36),
    borderRadius: BorderRadius.md,
    backgroundColor: STYLIST_GREEN_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: FontSizes.bodyLarge,
    color: '#0F172A',
    flex: 1,
    marginBottom: 0,
    ...rtlText.alignStart,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.verticalMd,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2F7',
  },
  detailLabel: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 14,
    color: '#374151',
    flex: 1,
    ...rtlText.alignStart,
  },
  detailValue: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#6B7280',
    marginStart: 12,
    ...rtlText.alignEnd,
    writingDirection: 'ltr',
  },
  detailVisualEnd: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    maxWidth: '52%',
    gap: 6,
  },
  onboardingThumb: {
    width: 72,
    height: 72,
  },
  detailCaption: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 12,
    color: '#6B7280',
    ...rtlText.alignEnd,
  },
  measurementsSkippedNote: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    color: '#6B7280',
    paddingVertical: Spacing.verticalSm,
    ...rtlText.alignStart,
  },
  subsectionLabel: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 13,
    color: '#374151',
    marginBottom: Spacing.sm,
    ...rtlText.alignStart,
  },
  stylePrefsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    ...rtlText.alignStart,
  },
  stylePrefChip: {
    width: scale(88),
    alignItems: 'center',
  },
  stylePrefImg: {
    width: scale(56),
    height: scale(56),
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
  },
  stylePrefImgPh: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stylePrefPhTxt: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 14,
    color: '#64748B',
  },
  stylePrefName: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  notesLabel: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 13,
    color: '#374151',
    ...rtlText.alignStart,
  },
  notesBody: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#4B5563',
    marginTop: 6,
    ...rtlText.alignStart,
  },
  footer: {
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingTop: Spacing.verticalMd,
  },
  footerUser: {
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingTop: Spacing.verticalMd,
    backgroundColor: '#FFF',
  },
  footerElevated: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    ...Shadows.medium,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15, 23, 42, 0.06)',
  },
  row2: { flexDirection: 'row' },
  btnHalf: { flex: 1 },
  btnFull: { width: '100%' },
  btnPrimary: {
    backgroundColor: GREEN,
    paddingVertical: scaleVertical(14),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFF',
    fontFamily: 'Cairo_700Bold',
    fontSize: 15,
    ...rtlText.alignStart,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: GREEN,
    paddingVertical: scaleVertical(14),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginEnd: Spacing.md,
  },
  btnOutlineText: {
    color: GREEN,
    fontFamily: 'Cairo_700Bold',
    fontSize: 15,
    ...rtlText.alignStart,
  },
  btnChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingVertical: scaleVertical(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: STYLIST_GREEN_MUTED,
  },
  btnChatText: {
    color: GREEN,
    fontFamily: 'Cairo_700Bold',
    fontSize: 14,
    marginStart: 8,
    ...rtlText.alignStart,
  },
  btnChatHistory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleVertical(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  btnChatHistoryText: {
    color: '#374151',
    fontFamily: 'Cairo_700Bold',
    fontSize: 14,
    marginStart: 8,
    ...rtlText.alignStart,
  },
  terminalBanner: {
    paddingVertical: Spacing.verticalMd,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  terminalOk: { backgroundColor: '#D1FAE5' },
  terminalBad: { backgroundColor: '#FEE2E2' },
  terminalText: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 14,
    color: '#111',
    ...rtlText.alignStart,
  },
  scrollContentUser: {
    paddingHorizontal: Spacing.screenPaddingHorizontal,
    paddingTop: Spacing.verticalMd,
    paddingBottom: Spacing.xxl,
  },
  userHeroCard: {
    borderRadius: BorderRadius.card,
    padding: Spacing.cardPadding,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.1)',
    ...Shadows.medium,
    shadowOpacity: 0.08,
    elevation: 4,
  },
  userHeroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userServiceThumb: {
    width: scale(88),
    height: scale(88),
    borderRadius: BorderRadius.lg,
    marginEnd: Spacing.md,
    backgroundColor: '#F1F5F9',
  },
  userServiceThumbPlaceholder: {
    width: scale(88),
    height: scale(88),
    borderRadius: BorderRadius.lg,
    marginEnd: Spacing.md,
    backgroundColor: STYLIST_GREEN_MUTED,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userHeroTextCol: {
    flex: 1,
    minWidth: 0,
  },
  stylistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.verticalSm,
  },
  stylistMini: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
  },
  stylistMiniPh: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: STYLIST_GREEN_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userServiceTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: scale(17),
    color: '#0F172A',
    ...rtlText.alignStart,
  },
  userStylistName: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: FontSizes.bodySmall,
    color: '#475569',
    flex: 1,
    ...rtlText.alignStart,
  },
  userPrice: {
    fontFamily: 'Cairo_700Bold',
    fontSize: FontSizes.bodyLarge,
    color: GREEN,
    marginTop: Spacing.verticalSm,
    writingDirection: 'ltr',
    ...rtlText.alignStart,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.verticalMd,
  },
  statusChip: {
    paddingHorizontal: scale(12),
    paddingVertical: scaleVertical(6),
    borderRadius: BorderRadius.badge,
  },
  statusChipText: {
    fontFamily: 'Cairo_700Bold',
    fontSize: scale(12),
    ...rtlText.alignStart,
  },
  payChip: {
    paddingHorizontal: scale(12),
    paddingVertical: scaleVertical(6),
    borderRadius: BorderRadius.badge,
    borderWidth: 1,
  },
  payChipOk: {
    backgroundColor: '#ECFDF5',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  payChipWait: {
    backgroundColor: '#FFFBEB',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  payChipText: {
    fontFamily: 'Cairo_700Bold',
    fontSize: scale(12),
    ...rtlText.alignStart,
  },
  payChipTextOk: { color: '#047857' },
  payChipTextWait: { color: '#B45309' },
  userOrderMeta: {
    fontFamily: 'Cairo_400Regular',
    fontSize: FontSizes.bodySmall,
    color: '#64748B',
    marginTop: Spacing.verticalMd,
    ...rtlText.alignStart,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.verticalMd,
    padding: Spacing.md,
    backgroundColor: '#FFFBEB',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  hint: {
    fontFamily: 'Cairo_400Regular',
    fontSize: FontSizes.bodySmall,
    color: '#92400E',
    flex: 1,
    ...rtlText.alignStart,
    marginTop: 0,
  },
  reportOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  reportSheet: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
    ...Shadows.large,
  },
  reportTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 17,
    color: '#111',
    marginBottom: 12,
    ...rtlText.alignStart,
  },
  reportHint: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    ...rtlText.alignStart,
  },
  reportCats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  reportChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportChipOn: {
    backgroundColor: '#ECFDF5',
    borderColor: GREEN,
  },
  reportChipText: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    color: '#374151',
    ...rtlText.alignStart,
  },
  reportChipTextOn: {
    color: GREEN,
    fontFamily: 'Cairo_700Bold',
  },
  reportInput: {
    minHeight: 80,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    marginBottom: 14,
    ...rtlInput,
  },
  btnReport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleVertical(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  btnReportText: {
    color: '#B91C1C',
    fontFamily: 'Cairo_700Bold',
    fontSize: 14,
    marginStart: 8,
    ...rtlText.alignStart,
  },
});
