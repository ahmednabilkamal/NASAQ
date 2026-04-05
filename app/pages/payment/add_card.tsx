import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Platform,
    Linking,
    Modal,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation, WebViewProps } from 'react-native-webview';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import apiService from '@/config/apiService';
import Toast from 'react-native-toast-message';
import {
    isPaymobReturnNavigationUrl,
    pickIntentionIdFromQuery,
} from '@/config/paymobReturn';

type WebViewShouldStartRequest = Parameters<
    NonNullable<WebViewProps['onShouldStartLoadWithRequest']>
>[0];

export default function AddCardScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
    const [paymobRedirectUrl, setPaymobRedirectUrl] = useState<string | null>(null);
    const [trackedIntentionId, setTrackedIntentionId] = useState<string | null>(null);
    const [trackedClientSecret, setTrackedClientSecret] = useState<string | null>(null);
    const paymobReturnLockRef = useRef(false);

    useEffect(() => {
        if (checkoutUrl) paymobReturnLockRef.current = false;
    }, [checkoutUrl]);

    const closeCheckout = useCallback(() => {
        setCheckoutUrl(null);
        setPaymobRedirectUrl(null);
        setTrackedIntentionId(null);
        setTrackedClientSecret(null);
    }, []);

    const startPaymob = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiService.saveCardIntent();
            const data = res?.data as
                | {
                      payment_url?: string;
                      paymob_redirect_url?: string | null;
                      intention_id?: string | null;
                      client_secret?: string | null;
                  }
                | undefined;
            if (!data?.payment_url) {
                throw new Error('تعذر تهيئة حفظ البطاقة');
            }
            setTrackedIntentionId(data.intention_id ? String(data.intention_id) : null);
            setTrackedClientSecret(
                typeof data.client_secret === 'string' && data.client_secret.length > 0
                    ? data.client_secret
                    : null
            );
            setPaymobRedirectUrl(
                typeof data.paymob_redirect_url === 'string' ? data.paymob_redirect_url : null
            );
            if (Platform.OS === 'web') {
                const ok = await Linking.canOpenURL(data.payment_url);
                if (ok) await Linking.openURL(data.payment_url);
                Toast.show({
                    type: 'info',
                    text1: 'تنبيه',
                    text2: 'أكمل الدفع في المتصفح ثم حدّث قائمة البطاقات من الملف الشخصي.',
                });
                router.back();
                return;
            }
            setCheckoutUrl(data.payment_url);
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || 'فشل التهيئة';
            Toast.show({ type: 'error', text1: 'خطأ', text2: msg });
        } finally {
            setLoading(false);
        }
    }, [router]);

    const finalize = useCallback(
        async (intentionIdFromUrl?: string | null) => {
            const intention_id = (trackedIntentionId ?? intentionIdFromUrl)?.trim() || undefined;
            const client_secret = trackedClientSecret?.trim() || undefined;
            if (!client_secret && !intention_id) {
                paymobReturnLockRef.current = false;
                Toast.show({
                    type: 'error',
                    text1: 'خطأ',
                    text2: 'تعذر التحقق من جلسة حفظ البطاقة.',
                });
                return;
            }
            try {
                await apiService.confirmSaveCard({
                    ...(intention_id ? { intention_id } : {}),
                    ...(client_secret ? { client_secret } : {}),
                });
                Toast.show({ type: 'success', text1: 'تم', text2: 'تم حفظ البطاقة' });
                closeCheckout();
                router.back();
            } catch (e: any) {
                paymobReturnLockRef.current = false;
                const msg = e?.response?.data?.message || e?.message || 'تعذر تأكيد الحفظ';
                Toast.show({ type: 'error', text1: 'خطأ', text2: msg });
            }
        },
        [router, closeCheckout, trackedIntentionId, trackedClientSecret]
    );

    const maybeFinishFromReturnUrl = useCallback(
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
                void finalize(id ?? null);
            } catch {
                if (trackedIntentionId || trackedClientSecret) {
                    paymobReturnLockRef.current = true;
                    void finalize(trackedIntentionId);
                }
            }
        },
        [finalize, trackedIntentionId, trackedClientSecret, paymobRedirectUrl]
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
                void finalize(id ?? null);
            } catch {
                /* ignore */
            }
        },
        [finalize, trackedIntentionId, trackedClientSecret]
    );

    const onWebNav = useCallback(
        (nav: WebViewNavigation) => {
            maybeFinishFromReturnUrl(nav.url);
        },
        [maybeFinishFromReturnUrl]
    );

    const onShouldStartLoadWithRequest = useCallback(
        (request: WebViewShouldStartRequest) => {
            if (isPaymobReturnNavigationUrl(request.url, paymobRedirectUrl)) {
                maybeFinishFromReturnUrl(request.url);
                return false;
            }
            return true;
        },
        [maybeFinishFromReturnUrl, paymobRedirectUrl]
    );

    const showModal = Boolean(checkoutUrl) && Platform.OS !== 'web';

    return (
        <>
            <SafeAreaView style={[styles.container, userScreenDirection]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                        <Ionicons name={getBackChevron()} size={22} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>إضافة بطاقة</Text>
                    <View style={{ width: 38 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <Text style={styles.body}>
                        سيتم فتح صفحة Paymob الآمنة لإدخال بيانات البطاقة. قد يُخصم مبلغ تحقق صغير حسب إعدادات
                        حسابك لدى Paymob، ثم تُحفظ البطاقة للدفع السريع لاحقاً.
                    </Text>
                    <TouchableOpacity
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                        onPress={startPaymob}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitBtnText}>متابعة إلى Paymob</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            <Modal
                visible={showModal}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={closeCheckout}
            >
                <View style={[styles.modalRoot, userScreenDirection]}>
                    <StatusBar barStyle="dark-content" />
                    <View
                        style={[
                            styles.modalHeader,
                            {
                                paddingTop: insets.top + 6,
                                paddingBottom: 12,
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={closeCheckout}
                            style={styles.modalCloseBtn}
                            accessibilityRole="button"
                            accessibilityLabel="إغلاق"
                            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                        >
                            <Ionicons name="close" size={26} color="#111" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>حفظ البطاقة</Text>
                        <View style={{ width: 38 }} />
                    </View>
                    {checkoutUrl ? (
                        <View style={[styles.modalWebViewWrap, { paddingBottom: insets.bottom }]}>
                            <WebView
                                source={{ uri: checkoutUrl }}
                                style={styles.modalWebView}
                                onMessage={(ev) => onWebMessage(ev.nativeEvent.data)}
                                onNavigationStateChange={onWebNav}
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
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFF',
    },
    headerBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'Cairo_700Bold', color: '#000', ...rtlText.alignStart },
    scroll: { padding: 24, paddingTop: 28 },
    body: {
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#444',
        lineHeight: 24,
        marginBottom: 28,
        ...rtlText.alignStart,
    },
    submitBtn: {
        backgroundColor: '#064E3B',
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Cairo_700Bold', ...rtlText.alignStart },
    modalRoot: { flex: 1, backgroundColor: '#FFF' },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFF',
    },
    modalCloseBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    modalTitle: { fontSize: 17, fontFamily: 'Cairo_700Bold', color: '#111', ...rtlText.alignStart },
    modalWebViewWrap: { flex: 1, backgroundColor: '#FFF' },
    modalWebView: { flex: 1, backgroundColor: '#FFF' },
});
