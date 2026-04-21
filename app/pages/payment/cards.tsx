import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Linking,
    Alert,
    RefreshControl,
    Platform,
    Modal,
    StatusBar,
} from 'react-native';
import { WebView, WebViewNavigation, WebViewProps } from 'react-native-webview';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import authService from '@/config/authService';
import apiService from '@/config/apiService';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import {
    isPaymobReturnNavigationUrl,
    pickIntentionIdFromQuery,
} from '@/config/paymobReturn';
import SarPriceText from '@/components/SarPriceText';

type WebViewShouldStartRequest = Parameters<
    NonNullable<WebViewProps['onShouldStartLoadWithRequest']>
>[0];

type UserCardRow = {
    id: number;
    last_four: string;
    card_name?: string | null;
    card_type?: string | null;
    paymob_ready?: boolean;
};

function buildOrderIdempotencyKey(serviceId: string | undefined): string {
    return `order:${serviceId ?? 'unknown'}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

export default function PaymentCardsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { order_id, service_id, price, idempotency_key } = useLocalSearchParams<{
        order_id?: string;
        service_id?: string;
        price?: string;
        idempotency_key?: string;
    }>();

    const isCheckout = Boolean(order_id || service_id);

    const [cards, setCards] = useState<UserCardRow[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
    const [fetchingCards, setFetchingCards] = useState(true);
    const [paying, setPaying] = useState(false);

    const [resolvedOrderId, setResolvedOrderId] = useState<number | null>(null);
    const [orderPrepLoading, setOrderPrepLoading] = useState(false);
    const [orderPrepError, setOrderPrepError] = useState<string | null>(null);

    const [selectedCheckoutMethod, setSelectedCheckoutMethod] = useState<'card' | null>(null);
    const [continuedToPaymob, setContinuedToPaymob] = useState(false);

    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
    const [paymobRedirectUrl, setPaymobRedirectUrl] = useState<string | null>(null);
    const [trackedIntentionId, setTrackedIntentionId] = useState<string | null>(null);
    const [trackedClientSecret, setTrackedClientSecret] = useState<string | null>(null);
    const [sdkLoading, setSdkLoading] = useState(false);
    const [sdkError, setSdkError] = useState<string | null>(null);
    /** Order total from Paymob intent — matches what the gateway charges (preferred over route `price`). */
    const [serverOrderTotal, setServerOrderTotal] = useState<number | null>(null);

    /** Avoid double confirm; reset each new checkout session. */
    const paymobReturnLockRef = useRef(false);
    /** Reused while user stays on this checkout screen to prevent duplicate orders on retries. */
    const orderIdempotencyKeyRef = useRef<string | null>(null);

    const selectedCard = useMemo(
        () => cards.find((c) => c.id === selectedCardId) ?? null,
        [cards, selectedCardId]
    );

    const loadCards = useCallback(async (silent = false) => {
        if (!silent) setFetchingCards(true);
        try {
            const res = await authService.getCards();
            const inner = (res as { data?: unknown })?.data ?? res;
            let fetched: UserCardRow[] = [];
            if (Array.isArray(inner)) {
                fetched = inner as UserCardRow[];
            } else if (inner && typeof inner === 'object') {
                const o = inner as Record<string, unknown>;
                const nested = o.data ?? o.cards;
                fetched = Array.isArray(nested) ? (nested as UserCardRow[]) : [];
            }

            if (Array.isArray(fetched)) {
                setCards(fetched);
                if (fetched.length > 0 && selectedCardId == null) {
                    const firstReady = fetched.find((c) => c.paymob_ready);
                    setSelectedCardId((firstReady ?? fetched[0]).id);
                }
            } else {
                setCards([]);
            }
        } catch (e) {
            console.error('Load cards error:', e);
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'تعذر تحميل البطاقات المحفوظة' });
        } finally {
            setFetchingCards(false);
        }
    }, [selectedCardId]);

    const onRefresh = useCallback(() => {
        loadCards(true);
    }, [loadCards]);

    useFocusEffect(
        useCallback(() => {
            loadCards();
        }, [loadCards])
    );

    useEffect(() => {
        if (!isCheckout) return;

        let cancelled = false;

        const run = async () => {
            setOrderPrepLoading(true);
            setOrderPrepError(null);
            try {
                let oid = Number(order_id);
                if (!oid && service_id) {
                    if (!orderIdempotencyKeyRef.current) {
                        orderIdempotencyKeyRef.current =
                            (typeof idempotency_key === 'string' && idempotency_key.trim()) ||
                            buildOrderIdempotencyKey(service_id);
                    }
                    const orderRes = await apiService.createOrder({
                        stylist_service_id: Number(service_id),
                        idempotency_key: orderIdempotencyKeyRef.current,
                    });
                    const order = (orderRes?.data as { id?: number }) ?? orderRes;
                    oid = Number(order?.id);
                }

                if (!oid || Number.isNaN(oid)) {
                    if (!cancelled) setOrderPrepError('تعذر تحضير الطلب');
                    return;
                }

                if (!cancelled) setResolvedOrderId(oid);
            } catch (e: any) {
                const msg = e?.response?.data?.message || e?.message || 'تعذر تحضير الطلب';
                if (!cancelled) setOrderPrepError(msg);
            } finally {
                if (!cancelled) setOrderPrepLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [idempotency_key, isCheckout, order_id, service_id]);

    useEffect(() => {
        if (!isCheckout || !continuedToPaymob || selectedCheckoutMethod !== 'card') return;
        if (!resolvedOrderId) return;
        if (Platform.OS === 'web') return;

        let cancelled = false;

        const run = async () => {
            setSdkLoading(true);
            setSdkError(null);
            setCheckoutUrl(null);
            setPaymobRedirectUrl(null);
            setTrackedIntentionId(null);
            setTrackedClientSecret(null);
            setServerOrderTotal(null);
            try {
                const intentRes = await apiService.sdkPaymentIntent(resolvedOrderId);
                const data = intentRes?.data as
                    | {
                          payment_url?: string;
                          paymob_redirect_url?: string | null;
                          intention_id?: string | null;
                          client_secret?: string | null;
                          total?: number;
                      }
                    | undefined;
                if (!data?.payment_url) {
                    if (!cancelled) setSdkError('تعذر تهيئة بوابة الدفع');
                    return;
                }
                if (!cancelled) {
                    setCheckoutUrl(data.payment_url);
                    setPaymobRedirectUrl(
                        typeof data.paymob_redirect_url === 'string' ? data.paymob_redirect_url : null
                    );
                    setTrackedIntentionId(data.intention_id ? String(data.intention_id) : null);
                    setTrackedClientSecret(
                        typeof data.client_secret === 'string' && data.client_secret.length > 0
                            ? data.client_secret
                            : null
                    );
                    if (data.total != null && Number.isFinite(Number(data.total))) {
                        setServerOrderTotal(Number(data.total));
                    }
                }
            } catch (e: any) {
                const msg = e?.response?.data?.message || e?.message || 'تعذر تهيئة الدفع';
                if (!cancelled) setSdkError(msg);
            } finally {
                if (!cancelled) setSdkLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [isCheckout, continuedToPaymob, selectedCheckoutMethod, resolvedOrderId]);

    useEffect(() => {
        if (checkoutUrl) paymobReturnLockRef.current = false;
    }, [checkoutUrl]);

    const finalizeOrderPayment = useCallback(
        async (intentionIdFromUrl?: string | null) => {
            if (!resolvedOrderId) return;
            const intention_id = (trackedIntentionId ?? intentionIdFromUrl)?.trim() || undefined;
            const client_secret = trackedClientSecret?.trim() || undefined;
            if (!client_secret && !intention_id) {
                paymobReturnLockRef.current = false;
                Toast.show({
                    type: 'error',
                    text1: 'خطأ',
                    text2: 'تعذر التحقق من جلسة الدفع. أعد المحاولة من البداية.',
                });
                return;
            }
            try {
                await apiService.confirmSdkPayment({
                    order_id: resolvedOrderId,
                    ...(intention_id ? { intention_id } : {}),
                    ...(client_secret ? { client_secret } : {}),
                });
                Toast.show({ type: 'success', text1: 'تم', text2: 'تم الدفع بنجاح' });
                setCheckoutUrl(null);
                setContinuedToPaymob(false);
                setTrackedClientSecret(null);
                router.replace('/pages/orders' as any);
            } catch (error: any) {
                paymobReturnLockRef.current = false;
                const apiMessage = error?.response?.data?.message;
                Toast.show({
                    type: 'error',
                    text1: 'خطأ',
                    text2: apiMessage || 'تعذر تأكيد الدفع مع الخادم',
                });
            }
        },
        [resolvedOrderId, router, trackedIntentionId, trackedClientSecret]
    );

    const onWebMessage = useCallback(
        (raw: string) => {
            try {
                const msg = JSON.parse(raw) as { type?: string; query?: Record<string, unknown> };
                if (msg.type !== 'paymob_return') return;
                if (paymobReturnLockRef.current) return;
                const id = pickIntentionIdFromQuery(msg.query) ?? trackedIntentionId;
                if (!id && !trackedClientSecret) return;
                paymobReturnLockRef.current = true;
                void finalizeOrderPayment(id ?? null);
            } catch {
                /* ignore */
            }
        },
        [finalizeOrderPayment, trackedIntentionId, trackedClientSecret]
    );

    const maybeFinishFromNavigation = useCallback(
        (url: string) => {
            if (!isPaymobReturnNavigationUrl(url, paymobRedirectUrl)) return;
            if (paymobReturnLockRef.current) return;
            try {
                const u = new URL(url);
                const q: Record<string, unknown> = {};
                u.searchParams.forEach((v, k) => {
                    q[k] = v;
                });
                const id = pickIntentionIdFromQuery(q) ?? trackedIntentionId;
                if (!id && !trackedClientSecret) return;
                paymobReturnLockRef.current = true;
                void finalizeOrderPayment(id ?? null);
            } catch {
                if (trackedIntentionId || trackedClientSecret) {
                    paymobReturnLockRef.current = true;
                    void finalizeOrderPayment(trackedIntentionId);
                }
            }
        },
        [finalizeOrderPayment, trackedIntentionId, trackedClientSecret, paymobRedirectUrl]
    );

    const onShouldStartLoadWithRequest = useCallback(
        (request: WebViewShouldStartRequest) => {
            if (isPaymobReturnNavigationUrl(request.url, paymobRedirectUrl)) {
                maybeFinishFromNavigation(request.url);
                return false;
            }
            return true;
        },
        [maybeFinishFromNavigation, paymobRedirectUrl]
    );

    const handleDeleteCard = async (cardId: number) => {
        Alert.alert('حذف البطاقة', 'هل تريد حذف هذه البطاقة؟', [
            { text: 'إلغاء', style: 'cancel' },
            {
                text: 'حذف',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await authService.deleteCard(cardId);
                        setCards((prev) => prev.filter((c) => c.id !== cardId));
                        if (selectedCardId === cardId) setSelectedCardId(null);
                        Toast.show({ type: 'success', text1: 'تم الحذف', text2: 'تم حذف البطاقة بنجاح' });
                    } catch {
                        Toast.show({ type: 'error', text1: 'خطأ', text2: 'فشل حذف البطاقة' });
                    }
                },
            },
        ]);
    };

    const handlePayHosted = async () => {
        if (!resolvedOrderId && !order_id && !service_id) return;
        setPaying(true);
        try {
            let payableOrderId = resolvedOrderId ?? Number(order_id);

            if (!payableOrderId && service_id) {
                if (!orderIdempotencyKeyRef.current) {
                    orderIdempotencyKeyRef.current =
                        (typeof idempotency_key === 'string' && idempotency_key.trim()) ||
                        buildOrderIdempotencyKey(service_id);
                }
                const orderRes = await apiService.createOrder({
                    stylist_service_id: Number(service_id),
                    idempotency_key: orderIdempotencyKeyRef.current,
                });
                const order = (orderRes?.data as any) ?? orderRes;
                payableOrderId = Number(order?.id);
            }

            if (!payableOrderId) {
                throw new Error('تعذر إنشاء الطلب');
            }

            const res = await apiService.initiatePayment(payableOrderId);
            const paymentUrl = (res?.data as any)?.payment_url;
            if (!paymentUrl) throw new Error('payment_url missing');
            const supported = await Linking.canOpenURL(paymentUrl);
            if (supported) {
                await Linking.openURL(paymentUrl);
            } else {
                Alert.alert('خطأ', 'تعذّر فتح صفحة الدفع.');
            }
        } catch (error: any) {
            const status = error?.response?.status;
            const apiMessage = error?.response?.data?.message;
            if (status === 502) {
                Toast.show({
                    type: 'error',
                    text1: 'بوابة الدفع غير متاحة',
                    text2: apiMessage || 'حاول الدفع مرة أخرى لاحقاً.',
                });
                return;
            }
            Toast.show({ type: 'error', text1: 'خطأ', text2: apiMessage || error?.message || 'فشلت عملية الدفع' });
        } finally {
            setPaying(false);
        }
    };

    const handlePaySavedCard = async () => {
        if (!resolvedOrderId || !selectedCard?.paymob_ready) return;
        setPaying(true);
        try {
            await apiService.chargeSavedCard({
                order_id: resolvedOrderId,
                user_card_id: selectedCard.id,
            });
            Toast.show({ type: 'success', text1: 'تم', text2: 'تم الدفع بنجاح' });
            router.replace('/pages/orders' as any);
        } catch (e: any) {
            const apiMessage = e?.response?.data?.message;
            Toast.show({
                type: 'error',
                text1: 'الدفع',
                text2: apiMessage || 'تعذر الدفع بالبطاقة المحفوظة',
            });
        } finally {
            setPaying(false);
        }
    };

    const displayPrice = useMemo(() => {
        const fromServer = serverOrderTotal;
        const fromRoute = price ? Number(price) : NaN;
        const n = fromServer != null && Number.isFinite(fromServer) ? fromServer : fromRoute;
        return Number.isFinite(n) ? n : null;
    }, [serverOrderTotal, price]);

    const showCheckoutModal =
        isCheckout &&
        Platform.OS !== 'web' &&
        continuedToPaymob &&
        selectedCheckoutMethod === 'card' &&
        Boolean(checkoutUrl);

    const canContinueToPay =
        isCheckout &&
        selectedCheckoutMethod === 'card' &&
        resolvedOrderId != null &&
        !orderPrepLoading &&
        !orderPrepError;

    const goBackToMethodChoice = () => {
        setContinuedToPaymob(false);
        setCheckoutUrl(null);
        setPaymobRedirectUrl(null);
        setSdkError(null);
        setTrackedIntentionId(null);
        setTrackedClientSecret(null);
        setServerOrderTotal(null);
    };

    const onWebNavChange = useCallback(
        (nav: WebViewNavigation) => {
            maybeFinishFromNavigation(nav.url);
        },
        [maybeFinishFromNavigation]
    );

    return (
        <>
        <SafeAreaView style={[styles.container, userScreenDirection]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name={getBackChevron()} size={22} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isCheckout ? 'الدفع' : 'بطاقاتي'}</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={fetchingCards} onRefresh={onRefresh} tintColor="#064E3B" />
                }
            >
                {isCheckout && displayPrice != null && (
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryTitle}>ملخص الدفع</Text>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                            <SarPriceText value={displayPrice} textStyle={styles.summaryTotal} />
                            <Text style={styles.summaryLabel}>الإجمالي (شامل الضريبة)</Text>
                        </View>
                        {serverOrderTotal != null ? (
                            <Text style={styles.summarySynced}>يتطابق مع مبلغ Paymob</Text>
                        ) : null}
                    </View>
                )}

                {isCheckout && !orderPrepLoading && !orderPrepError && !continuedToPaymob && resolvedOrderId != null && (
                    <View style={styles.methodSection}>
                        <Text style={styles.methodSectionTitle}>طريقة الدفع</Text>
                        <TouchableOpacity
                            style={[
                                styles.methodRow,
                                selectedCheckoutMethod === 'card' && styles.methodRowSelected,
                            ]}
                            onPress={() => setSelectedCheckoutMethod('card')}
                            activeOpacity={0.85}
                        >
                            <View
                                style={[
                                    styles.radio,
                                    selectedCheckoutMethod === 'card' && styles.radioActive,
                                ]}
                            >
                                {selectedCheckoutMethod === 'card' ? <View style={styles.radioDot} /> : null}
                            </View>
                            <Text style={styles.methodLabel}>بطاقة ائتمان أو خصم</Text>
                            <Ionicons name="card" size={22} color="#064E3B" />
                        </TouchableOpacity>
                        <Text style={styles.methodHint}>
                            فيزا، مدى، ماستركارد — عبر Paymob بشكل آمن (قد تظهر نافذة 3D Secure).
                        </Text>

                        {cards.some((c) => c.paymob_ready) ? (
                            <View style={styles.savedPick}>
                                <Text style={styles.savedPickTitle}>بطاقة محفوظة</Text>
                                {cards
                                    .filter((c) => c.paymob_ready)
                                    .map((card) => (
                                        <TouchableOpacity
                                            key={card.id}
                                            style={[
                                                styles.savedMiniRow,
                                                selectedCardId === card.id && styles.savedMiniRowSelected,
                                            ]}
                                            onPress={() => setSelectedCardId(card.id)}
                                            activeOpacity={0.85}
                                        >
                                            <View
                                                style={[
                                                    styles.radioSm,
                                                    selectedCardId === card.id && styles.radioSmActive,
                                                ]}
                                            >
                                                {selectedCardId === card.id && <View style={styles.radioDotSm} />}
                                            </View>
                                            <Text style={styles.savedMiniText}>•••• {card.last_four}</Text>
                                        </TouchableOpacity>
                                    ))}
                                <TouchableOpacity
                                    style={[styles.payBtn, styles.savedPayBtn, paying && { opacity: 0.7 }]}
                                    onPress={handlePaySavedCard}
                                    disabled={paying || !selectedCard?.paymob_ready}
                                    activeOpacity={0.85}
                                >
                                    {paying ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.payBtnText}>الدفع بالبطاقة المحفوظة</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.continueBtn, !canContinueToPay && styles.continueBtnDisabled]}
                            onPress={() => setContinuedToPaymob(true)}
                            disabled={!canContinueToPay}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.continueBtnText}>متابعة بدفع ببطاقة جديدة</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isCheckout && orderPrepLoading && (
                    <View style={styles.sdkLoading}>
                        <ActivityIndicator size="large" color="#064E3B" />
                        <Text style={styles.sdkLoadingText}>جاري تحضير الطلب…</Text>
                    </View>
                )}

                {isCheckout && !orderPrepLoading && orderPrepError ? (
                    <View style={styles.sdkErrBox}>
                        <Text style={styles.sdkErrText}>{orderPrepError}</Text>
                    </View>
                ) : null}

                {isCheckout && continuedToPaymob && sdkLoading && Platform.OS !== 'web' && (
                    <View style={styles.sdkLoading}>
                        <ActivityIndicator size="large" color="#064E3B" />
                        <Text style={styles.sdkLoadingText}>جاري تهيئة بوابة الدفع…</Text>
                    </View>
                )}

                {isCheckout && continuedToPaymob && !sdkLoading && sdkError ? (
                    <View style={styles.sdkErrBox}>
                        <Text style={styles.sdkErrText}>{sdkError}</Text>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={goBackToMethodChoice}>
                            <Text style={styles.secondaryBtnText}>العودة لاختيار الطريقة</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {isCheckout && continuedToPaymob && Platform.OS === 'web' && selectedCheckoutMethod === 'card' && (
                    <TouchableOpacity
                        style={[styles.payBtn, paying && { opacity: 0.7 }]}
                        onPress={handlePayHosted}
                        disabled={paying || !resolvedOrderId}
                    >
                        {paying ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.payBtnText}>المتابعة لصفحة الدفع</Text>
                        )}
                    </TouchableOpacity>
                )}


                {!isCheckout && (
                    <View style={styles.savedCardBlock}>
                        {fetchingCards ? (
                            <ActivityIndicator color="#064E3B" style={{ margin: 20 }} />
                        ) : cards.length === 0 ? (
                            <View style={styles.emptyCards}>
                                <Ionicons name="card-outline" size={36} color="#DDD" />
                                <Text style={styles.emptyCardsText}>لا توجد بطاقات محفوظة</Text>
                            </View>
                        ) : (
                            cards.map((card) => (
                                <TouchableOpacity
                                    key={card.id}
                                    style={[
                                        styles.savedCardRow,
                                        selectedCardId === card.id && styles.savedCardRowSelected,
                                    ]}
                                    onPress={() => setSelectedCardId(card.id)}
                                    activeOpacity={0.85}
                                >
                                    <View
                                        style={[
                                            styles.radioSm,
                                            selectedCardId === card.id && styles.radioSmActive,
                                        ]}
                                    >
                                        {selectedCardId === card.id && <View style={styles.radioDotSm} />}
                                    </View>

                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardDigits}>•••• {card.last_four}</Text>
                                        <Text style={styles.cardHolder}>
                                            {card.card_name}
                                            {card.paymob_ready ? ' · Paymob' : ''}
                                        </Text>
                                    </View>

                                    <Ionicons
                                        name={card.card_type === 'visa' ? 'card' : 'card-outline'}
                                        size={22}
                                        color="#1A1F71"
                                    />

                                    <TouchableOpacity
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        onPress={() => handleDeleteCard(card.id)}
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))
                        )}

                        <TouchableOpacity
                            style={styles.addCardRow}
                            onPress={() => router.push('/pages/payment/add_card' as any)}
                        >
                            <Text style={styles.addCardText}>إضافة بطاقة عبر Paymob</Text>
                            <Ionicons name="add-circle-outline" size={20} color="#064E3B" />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {!isCheckout && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.payBtn}
                        onPress={() => router.push('/pages/payment/add_card' as any)}
                    >
                        <Ionicons name="add" size={20} color="#FFF" style={{ marginStart: 8 }} />
                        <Text style={styles.payBtnText}>إضافة بطاقة</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>

        <Modal
            visible={showCheckoutModal}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={goBackToMethodChoice}
        >
            <View style={[styles.checkoutModalRoot, userScreenDirection]}>
                <StatusBar barStyle="dark-content" />
                <View
                    style={[
                        styles.checkoutModalHeader,
                        {
                            paddingTop: insets.top + 6,
                            paddingBottom: 12,
                        },
                    ]}
                >
                    <TouchableOpacity
                        onPress={goBackToMethodChoice}
                        style={styles.checkoutModalCloseBtn}
                        accessibilityRole="button"
                        accessibilityLabel="إغلاق"
                        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                    >
                        <Ionicons name="close" size={26} color="#111" />
                    </TouchableOpacity>
                    <Text style={styles.checkoutModalTitle}>إتمام الدفع</Text>
                    <View style={{ width: 38 }} />
                </View>
                {checkoutUrl ? (
                    <View style={[styles.checkoutWebViewWrap, { paddingBottom: insets.bottom }]}>
                        <WebView
                            source={{ uri: checkoutUrl }}
                            style={styles.checkoutWebView}
                            onMessage={(ev) => onWebMessage(ev.nativeEvent.data)}
                            onNavigationStateChange={onWebNavChange}
                            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                            javaScriptEnabled
                            domStorageEnabled
                            thirdPartyCookiesEnabled
                            sharedCookiesEnabled
                            originWhitelist={['*']}
                            setSupportMultipleWindows={false}
                        />
                    </View>
                ) : null}
            </View>
        </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'Cairo_700Bold', color: '#000', ...rtlText.alignStart },
    scroll: { padding: 20 },

    sdkLoading: { alignItems: 'center', paddingVertical: 24 },
    sdkLoadingText: { marginTop: 12, fontFamily: 'Cairo_400Regular', color: '#6B7280', ...rtlText.alignStart },
    sdkErrBox: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    sdkErrText: { fontFamily: 'Cairo_400Regular', color: '#B91C1C', ...rtlText.alignStart },
    secondaryBtn: {
        marginTop: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#064E3B',
        borderRadius: 12,
    },
    secondaryBtnText: { fontFamily: 'Cairo_700Bold', color: '#064E3B', ...rtlText.alignStart },

    checkoutModalRoot: { flex: 1, backgroundColor: '#FFF' },
    checkoutModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFF',
    },
    checkoutModalCloseBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutModalTitle: {
        fontSize: 17,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        ...rtlText.alignStart,
    },
    checkoutWebViewWrap: { flex: 1, backgroundColor: '#FFF' },
    checkoutWebView: { flex: 1, backgroundColor: '#FFF' },

    savedCardBlock: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    emptyCards: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    emptyCardsText: { fontSize: 14, fontFamily: 'Cairo_400Regular', color: '#AAA', ...rtlText.alignStart },

    savedCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    savedCardRowSelected: { backgroundColor: '#F7FAF9' },
    radioSm: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSmActive: { borderColor: '#064E3B' },
    radioDotSm: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#064E3B' },
    cardInfo: { flex: 1, alignItems: 'flex-start' },
    cardDigits: { fontSize: 15, fontFamily: 'Cairo_700Bold', color: '#1F2937', letterSpacing: 1 },
    cardHolder: { fontSize: 11, fontFamily: 'Cairo_400Regular', color: '#9CA3AF', marginTop: 2 },

    addCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 8,
        padding: 14,
        paddingHorizontal: 16,
    },
    addCardText: { fontSize: 14, fontFamily: 'Cairo_700Bold', color: '#064E3B', ...rtlText.alignStart },

    summaryBox: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 16,
    },
    summaryDivider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 14 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: 13, fontFamily: 'Cairo_700Bold', color: '#6B7280', ...rtlText.alignStart },
    summaryTotal: { fontSize: 20, fontFamily: 'Cairo_700Bold', color: '#000' },
    summarySynced: {
        marginTop: 10,
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#059669',
        textAlign: 'center',
    },

    footer: { padding: 20, paddingBottom: 28, backgroundColor: '#F8F9FA' },
    payBtn: {
        backgroundColor: '#064E3B',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#064E3B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    savedPayBtn: { marginTop: 12, height: 48, borderRadius: 24 },
    payBtnText: { color: '#FFF', fontSize: 18, fontFamily: 'Cairo_700Bold', ...rtlText.alignStart },

    methodSection: { marginBottom: 8 },
    methodSectionTitle: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        marginBottom: 12,
        ...rtlText.alignStart,
    },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: 'transparent',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    methodRowSelected: {
        borderColor: '#064E3B',
        backgroundColor: '#F7FAF9',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActive: { borderColor: '#064E3B' },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#064E3B' },
    methodLabel: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        ...rtlText.alignStart,
    },
    methodHint: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        marginBottom: 16,
        ...rtlText.alignStart,
    },
    savedPick: { marginBottom: 16 },
    savedPickTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#374151',
        marginBottom: 8,
        ...rtlText.alignStart,
    },
    savedMiniRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#FFF',
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    savedMiniRowSelected: { borderColor: '#064E3B', backgroundColor: '#F7FAF9' },
    savedMiniText: { fontFamily: 'Cairo_600SemiBold', color: '#111', ...rtlText.alignStart },
    continueBtn: {
        backgroundColor: '#064E3B',
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueBtnDisabled: {
        backgroundColor: '#9CA3AF',
        opacity: 0.85,
    },
    continueBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        ...rtlText.alignStart,
    },
});
