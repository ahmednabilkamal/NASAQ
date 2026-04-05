import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/config/authContext';
import { isStylistUser, isStylistVerified } from '@/config/navigationFlow';
import { ROUTES } from '@/constants/routes';
import apiService, { StylistEarningsSummary } from '@/config/apiService';
import StylistBottomNav from '@/components/StylistBottomNav';
import {
    StylistScreenHeader,
    STYLIST_GREEN,
} from '@/components/StylistScreenHeader';
import { stylistScreenDirection } from '@/config/rtlLayout';
import { rtlInput, rtlText } from '@/config/rtlText';
import SarPriceText from '@/components/SarPriceText';
import SaudiRiyalSymbol from '@/components/SaudiRiyalSymbol';
import { formatSarPrice, toArabicIndicDigits } from '@/utils/formatSarPrice';
import Toast from 'react-native-toast-message';

function maskIban(iban: string | null | undefined): string {
    if (!iban || iban.length < 8) return iban || '—';
    return `****${iban.slice(-4)}`;
}

function orderEarningLabel(status: string): string {
    if (status === 'completed') return 'مكتمل';
    if (status === 'cancelled') return 'ملغى';
    return 'قيد التسوية';
}

function payoutStatusLabel(status: string): string {
    if (status === 'paid') return 'تم التحويل';
    if (status === 'rejected') return 'مرفوض';
    return 'قيد المراجعة';
}

const PAYOUT_STATUS_COLORS: Record<string, string> = {
    pending: '#F59E0B',
    paid: '#10B981',
    rejected: '#EF4444',
};

export default function StylistEarningsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState<StylistEarningsSummary | null>(null);
    const [payoutSheetOpen, setPayoutSheetOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [sheetBankName, setSheetBankName] = useState('');
    const [sheetBankHolder, setSheetBankHolder] = useState('');
    const [sheetIban, setSheetIban] = useState('');
    const [submittingPayout, setSubmittingPayout] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        } else if (!authLoading && isAuthenticated && !isStylistUser(user)) {
            router.replace('/pages/tabs/homescreen' as any);
        } else if (
            !authLoading &&
            isAuthenticated &&
            isStylistUser(user) &&
            !isStylistVerified(user)
        ) {
            router.replace(ROUTES.stylist.pendingVerification as any);
        }
    }, [isAuthenticated, authLoading, user]);

    const fetchEarnings = useCallback(async () => {
        try {
            const res = await apiService.getStylistEarnings();
            const data = res?.data;
            if (data && typeof data === 'object') {
                setSummary(data as StylistEarningsSummary);
            }
        } catch (error) {
            console.error('Earnings fetch error:', error);
            Toast.show({ type: 'error', text1: 'تعذر تحميل الأرباح' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchEarnings();
    }, [isAuthenticated, fetchEarnings]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEarnings();
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const months = [
            'يناير',
            'فبراير',
            'مارس',
            'أبريل',
            'مايو',
            'يونيو',
            'يوليو',
            'أغسطس',
            'سبتمبر',
            'أكتوبر',
            'نوفمبر',
            'ديسمبر',
        ];
        return `${d.getDate()} ${months[d.getMonth()]}`;
    };

    const openWithdraw = () => {
        if (summary?.earnings_fallback) {
            Toast.show({
                type: 'info',
                text1: 'طلب السحب غير متاح',
                text2: 'يتطلب تحديث الخادم لعرض الرصيد الفعلي وطلبات السحب.',
            });
            return;
        }
        const maxAvail = summary?.available_balance ?? 0;
        const onHold = summary?.payout_hold_balance ?? 0;
        const holdH = summary?.payout_hold_hours ?? 24;
        if (maxAvail < 0.01) {
            if (onHold >= 0.01) {
                Toast.show({
                    type: 'info',
                    text1: 'السحب غير متاح بعد',
                    text2: `يصبح صافي الطلب المكتمل قابلاً للسحب بعد مرور ${toArabicIndicDigits(String(holdH))} ساعة من اكتمال الطلب.`,
                });
            } else {
                Toast.show({
                    type: 'info',
                    text1: 'لا يوجد رصيد قابل للسحب',
                });
            }
            return;
        }
        setSheetBankName((summary?.bank?.bank_name ?? '').trim());
        setSheetBankHolder((summary?.bank?.bank_account_holder ?? '').trim());
        setSheetIban((summary?.bank?.iban ?? '').trim());
        setWithdrawAmount('');
        setPayoutSheetOpen(true);
    };

    const closePayoutSheet = () => {
        if (submittingPayout) return;
        setPayoutSheetOpen(false);
    };

    const fillMaxAmount = () => {
        const max = summary?.available_balance ?? 0;
        if (max > 0) setWithdrawAmount(max.toFixed(2));
    };

    const submitWithdraw = async () => {
        const bankName = sheetBankName.trim();
        const holder = sheetBankHolder.trim();
        const iban = sheetIban.replace(/\s/g, '').trim();
        if (!bankName || !holder || !iban) {
            Toast.show({ type: 'error', text1: 'أكمل جميع بيانات الحساب البنكي' });
            return;
        }
        if (iban.length < 15 || iban.length > 34) {
            Toast.show({ type: 'error', text1: 'تأكد من صحة رقم الآيبان' });
            return;
        }
        const raw = withdrawAmount.replace(/,/g, '.').trim();
        const amount = parseFloat(raw);
        if (!Number.isFinite(amount) || amount < 1) {
            Toast.show({ type: 'error', text1: 'أدخل مبلغاً صحيحاً' });
            return;
        }
        const max = summary?.available_balance ?? 0;
        if (amount > max) {
            Toast.show({ type: 'error', text1: 'المبلغ يتجاوز الرصيد المتاح' });
            return;
        }
        setSubmittingPayout(true);
        try {
            await apiService.updateStylistProfile({
                bank_name: bankName,
                bank_account_holder: holder,
                iban,
            });
            await apiService.requestStylistPayout(amount);
            Toast.show({ type: 'success', text1: 'تم إرسال طلب السحب' });
            setPayoutSheetOpen(false);
            await fetchEarnings();
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'تعذر إرسال الطلب';
            Toast.show({ type: 'error', text1: typeof msg === 'string' ? msg : String(msg) });
        } finally {
            setSubmittingPayout(false);
        }
    };

    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={STYLIST_GREEN} />
            </View>
        );
    }

    const avail = summary?.available_balance ?? 0;
    const payoutHold = summary?.payout_hold_balance ?? 0;
    const payoutHoldHours = summary?.payout_hold_hours ?? 24;
    const pendingClr = summary?.pending_clearance ?? 0;
    const paidOut = summary?.total_paid_out ?? 0;
    const commissionPct = summary?.commission_percent ?? 0;
    const canRequestPayout =
        !summary?.earnings_fallback && avail >= 0.01;

    return (
        <SafeAreaView style={[styles.container, stylistScreenDirection]} edges={['top']}>
            <StylistScreenHeader
                title="الأرباح"
                rightAccessory={
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => router.push('/pages/notifications' as any)}
                    >
                        <Ionicons name="notifications-outline" size={22} color={STYLIST_GREEN} />
                    </TouchableOpacity>
                }
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={STYLIST_GREEN} />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={STYLIST_GREEN} />
                    }
                >
                    {summary?.earnings_fallback ? (
                        <View style={styles.fallbackBanner}>
                            <Ionicons name="information-circle-outline" size={20} color="#92400E" />
                            <Text style={styles.fallbackBannerText}>
                                عرض تقديري من الطلبات: الرصيد القابل للسحب وطلبات السحب تظهر بالكامل بعد تحديث
                                الخادم.
                            </Text>
                        </View>
                    ) : null}

                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceLabel}>الرصيد القابل للسحب</Text>
                        <SarPriceText value={avail} textStyle={styles.balanceAmount} />
                        {payoutHold >= 0.01 ? (
                            <Text style={styles.payoutHoldHint}>
                                {formatSarPrice(payoutHold)} قيد الانتظار: تُتاح للسحب بعد{' '}
                                {toArabicIndicDigits(String(payoutHoldHours))} ساعة من اكتمال كل طلب.
                            </Text>
                        ) : null}
                        <Text style={styles.commissionHint}>
                            عمولة المنصة على الطلبات: {toArabicIndicDigits(String(commissionPct.toFixed(1)))}٪
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={[styles.statMini, { flex: 1 }]}>
                            <Text style={styles.statMiniLabel}>قيد التسوية</Text>
                            <SarPriceText value={pendingClr} textStyle={styles.statMiniVal} />
                            <Text style={styles.statMiniSub}>طلبات مدفوعة لم تُكمّل بعد</Text>
                        </View>
                        <View style={[styles.statMini, { flex: 1 }]}>
                            <Text style={styles.statMiniLabel}>تم تحويله</Text>
                            <SarPriceText value={paidOut} textStyle={styles.statMiniVal} />
                            <Text style={styles.statMiniSub}>مجموع السحوبات المكتملة</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>بيانات السحب</Text>
                    <View style={styles.withdrawalCard}>
                        <View style={styles.withdrawalRow}>
                            <View style={styles.bankIconContainer}>
                                <Ionicons name="business-outline" size={22} color="#064E3B" />
                            </View>
                            <View style={styles.withdrawalInfo}>
                                <Text style={styles.bankName}>
                                    {summary?.bank?.bank_name || 'لم يُضف البنك'}
                                </Text>
                                <Text style={styles.bankDetails}>
                                    {summary?.bank?.bank_account_holder || '—'} ·{' '}
                                    {maskIban(summary?.bank?.iban ?? undefined)}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/pages/stylist/edit_profile' as any)}>
                                <Text style={styles.editText}>تعديل</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.withdrawButton,
                            (!canRequestPayout || summary?.earnings_fallback) && styles.withdrawButtonDisabled,
                        ]}
                        activeOpacity={0.8}
                        onPress={openWithdraw}
                    >
                        <Ionicons name="wallet-outline" size={20} color="#FFF" />
                        <Text style={styles.withdrawButtonText}>طلب سحب</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>صافي أرباح الطلبات</Text>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colStatus]}>الحالة</Text>
                        <Text style={[styles.tableHeaderText, styles.colAmount]}>صافي</Text>
                        <Text style={[styles.tableHeaderText, styles.colDate]}>التاريخ</Text>
                        <Text style={[styles.tableHeaderText, styles.colOrder]}>الطلب</Text>
                    </View>

                    {!summary?.recent_orders?.length ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={36} color="#CCC" />
                            <Text style={styles.emptyText}>لا توجد طلبات مدفوعة بعد</Text>
                        </View>
                    ) : (
                        summary.recent_orders.map((o, index) => {
                            const net = o.stylist_earning_amount ?? 0;
                            const label = orderEarningLabel(o.status);
                            return (
                                <View
                                    key={`o-${o.id}`}
                                    style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
                                >
                                    <View style={[styles.colStatus, { alignItems: 'flex-start' }]}>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                {
                                                    backgroundColor:
                                                        o.status === 'completed' ? '#10B98120' : '#F59E0B20',
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: o.status === 'completed' ? '#10B981' : '#F59E0B' },
                                                ]}
                                            >
                                                {label}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[styles.colAmount, styles.amountCell]}>
                                        <SarPriceText value={net} textStyle={[styles.tableCell, styles.amountText]} />
                                    </View>
                                    <Text style={[styles.tableCell, styles.colDate]}>
                                        {formatDate(o.created_at)}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.colOrder]}>#ORD-{String(o.id).padStart(4, '0')}</Text>
                                </View>
                            );
                        })
                    )}

                    <Text style={styles.sectionTitle}>طلبات السحب</Text>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colStatus]}>الحالة</Text>
                        <Text style={[styles.tableHeaderText, styles.colAmount]}>المبلغ</Text>
                        <Text style={[styles.tableHeaderText, styles.colDate]}>التاريخ</Text>
                        <Text style={[styles.tableHeaderText, styles.colOrder]}>المرجع</Text>
                    </View>

                    {!summary?.recent_payouts?.length ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cash-outline" size={36} color="#CCC" />
                            <Text style={styles.emptyText}>لا توجد طلبات سحب</Text>
                        </View>
                    ) : (
                        summary.recent_payouts.map((p, index) => {
                            const color = PAYOUT_STATUS_COLORS[p.status] || '#6B7280';
                            return (
                                <View
                                    key={`p-${p.id}`}
                                    style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
                                >
                                    <View style={[styles.colStatus, { alignItems: 'flex-start' }]}>
                                        <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                                            <Text style={[styles.statusText, { color }]}>
                                                {payoutStatusLabel(p.status)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[styles.colAmount, styles.amountCell]}>
                                        <SarPriceText
                                            value={p.amount}
                                            textStyle={[styles.tableCell, styles.amountText]}
                                        />
                                    </View>
                                    <Text style={[styles.tableCell, styles.colDate]}>
                                        {formatDate(p.created_at)}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.colOrder]}>#{p.id}</Text>
                                </View>
                            );
                        })
                    )}

                    <View style={{ height: 120 }} />
                </ScrollView>
            )}

            <Modal
                visible={payoutSheetOpen}
                transparent
                animationType="slide"
                onRequestClose={closePayoutSheet}
            >
                <View style={styles.payoutSheetRoot}>
                    <Pressable style={styles.payoutSheetBackdrop} onPress={closePayoutSheet} />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.payoutSheetKb}
                    >
                        <View
                            style={[
                                styles.payoutSheetCard,
                                stylistScreenDirection,
                                { paddingBottom: Math.max(insets.bottom, 20) + 8 },
                            ]}
                        >
                            <View style={styles.payoutSheetHandle} />
                            <Text style={styles.payoutSheetTitle}>طلب سحب الأرباح</Text>
                            <Text style={styles.payoutSheetSubtitle}>
                                أدخل بيانات الحساب كما في البنك، ثم المبلغ المراد سحبه.
                            </Text>

                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                style={styles.payoutSheetScroll}
                                contentContainerStyle={styles.payoutSheetScrollContent}
                            >
                                <Text style={styles.payoutFieldLabel}>اسم البنك</Text>
                                <TextInput
                                    style={styles.payoutInput}
                                    placeholder="مثال: بنك الراجحي"
                                    placeholderTextColor="#999"
                                    value={sheetBankName}
                                    onChangeText={setSheetBankName}
                                />
                                <Text style={styles.payoutFieldLabel}>اسم صاحب الحساب</Text>
                                <TextInput
                                    style={styles.payoutInput}
                                    placeholder="كما في البنك"
                                    placeholderTextColor="#999"
                                    value={sheetBankHolder}
                                    onChangeText={setSheetBankHolder}
                                />
                                <Text style={styles.payoutFieldLabel}>الآيبان (IBAN)</Text>
                                <TextInput
                                    style={styles.payoutInput}
                                    placeholder="SA..."
                                    placeholderTextColor="#999"
                                    value={sheetIban}
                                    onChangeText={setSheetIban}
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                />
                                <View style={styles.amountRow}>
                                    <View style={styles.payoutAmountLabelRow}>
                                        <Text style={[styles.payoutFieldLabel, styles.payoutFieldLabelInline]}>
                                            المبلغ
                                        </Text>
                                        <SaudiRiyalSymbol size={14} color="#374151" />
                                    </View>
                                    <TouchableOpacity onPress={fillMaxAmount} hitSlop={12}>
                                        <Text style={styles.fillMaxLink}>سحب كامل الرصيد</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={styles.payoutInput}
                                    placeholder="0.00"
                                    placeholderTextColor="#999"
                                    keyboardType="decimal-pad"
                                    value={withdrawAmount}
                                    onChangeText={setWithdrawAmount}
                                />
                                <Text style={styles.payoutAmountHint}>
                                    الحد الأقصى: {formatSarPrice(avail)}
                                </Text>
                            </ScrollView>

                            <View style={styles.payoutSheetActions}>
                                <TouchableOpacity
                                    style={styles.payoutBtnGhost}
                                    onPress={closePayoutSheet}
                                    disabled={submittingPayout}
                                >
                                    <Text style={styles.payoutBtnGhostText}>إلغاء</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.payoutBtnPrimary,
                                        submittingPayout && styles.payoutBtnPrimaryDisabled,
                                    ]}
                                    onPress={submitWithdraw}
                                    disabled={submittingPayout}
                                    activeOpacity={0.85}
                                >
                                    {submittingPayout ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.payoutBtnPrimaryText}>تأكيد وإرسال الطلب</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <StylistBottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    notificationButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(6, 78, 59, 0.12)',
    },
    fallbackBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#FEF3C7',
        borderRadius: 14,
        padding: 14,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    fallbackBannerText: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#78350F',
        ...rtlText.alignStart,
    },
    withdrawButtonDisabled: {
        opacity: 0.55,
    },
    balanceCard: {
        backgroundColor: '#064E3B',
        borderRadius: 20,
        padding: 24,
        marginTop: 16,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#A7F3D0',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 36,
        fontFamily: 'Cairo_700Bold',
        color: '#FFF',
        marginBottom: 4,
    },
    payoutHoldHint: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#FEF3C7',
        marginTop: 10,
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 8,
    },
    commissionHint: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#A7F3D0',
        marginTop: 8,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 14,
    },
    statMini: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    statMiniLabel: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        ...rtlText.alignStart,
    },
    statMiniVal: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        marginTop: 4,
        ...rtlText.alignStart,
    },
    statMiniSub: {
        fontSize: 10,
        fontFamily: 'Cairo_400Regular',
        color: '#AAA',
        marginTop: 4,
        ...rtlText.alignStart,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        marginTop: 24,
        marginBottom: 14,
        ...rtlText.alignStart,
    },
    withdrawalCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    withdrawalRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bankIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    withdrawalInfo: {
        flex: 1,
        marginHorizontal: 14,
    },
    bankName: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        ...rtlText.alignStart,
    },
    bankDetails: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        marginTop: 2,
        ...rtlText.alignStart,
    },
    editText: {
        fontSize: 13,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    withdrawButton: {
        backgroundColor: '#064E3B',
        borderRadius: 50,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
    },
    withdrawButtonText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#FFF',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 4,
    },
    tableHeaderText: {
        fontSize: 12,
        fontFamily: 'Cairo_700Bold',
        color: '#666',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        alignItems: 'center',
    },
    tableRowEven: {
        backgroundColor: '#FAFAFA',
    },
    tableCell: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#333',
        textAlign: 'center',
    },
    colOrder: {
        flex: 2,
        ...rtlText.alignStart,
    },
    colDate: { flex: 2, textAlign: 'center' },
    colAmount: { flex: 2, textAlign: 'center' },
    colStatus: { flex: 1.5, textAlign: 'center' },
    amountCell: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    amountText: {
        fontSize: 13,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
        textAlign: 'center',
    },
    statusBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    statusText: {
        fontSize: 11,
        fontFamily: 'Cairo_700Bold',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        gap: 8,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
    },
    payoutSheetRoot: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    payoutSheetBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    payoutSheetKb: {
        width: '100%',
        maxHeight: '88%',
    },
    payoutSheetCard: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 22,
        paddingTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 16,
    },
    payoutSheetHandle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E5E7EB',
        marginBottom: 16,
    },
    payoutSheetTitle: {
        fontSize: 20,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        marginBottom: 6,
        ...rtlText.alignStart,
    },
    payoutSheetSubtitle: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 16,
        ...rtlText.alignStart,
    },
    payoutSheetScroll: {
        maxHeight: 340,
    },
    payoutSheetScrollContent: {
        paddingBottom: 8,
    },
    payoutFieldLabel: {
        fontSize: 13,
        fontFamily: 'Cairo_600SemiBold',
        color: '#374151',
        marginBottom: 8,
        ...rtlText.alignStart,
    },
    payoutFieldLabelInline: {
        marginBottom: 0,
        flexShrink: 1,
    },
    payoutInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        marginBottom: 14,
        backgroundColor: '#FAFAFA',
        ...rtlInput,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 8,
    },
    payoutAmountLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexShrink: 1,
    },
    fillMaxLink: {
        fontSize: 13,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
    },
    payoutAmountHint: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#9CA3AF',
        marginTop: -6,
        marginBottom: 4,
        ...rtlText.alignStart,
    },
    payoutSheetActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    payoutBtnGhost: {
        paddingVertical: 14,
        paddingHorizontal: 8,
    },
    payoutBtnGhostText: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 15,
        color: '#6B7280',
    },
    payoutBtnPrimary: {
        flex: 1,
        backgroundColor: '#064E3B',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    payoutBtnPrimaryDisabled: {
        opacity: 0.65,
    },
    payoutBtnPrimaryText: {
        color: '#FFF',
        fontFamily: 'Cairo_700Bold',
        fontSize: 15,
    },
});
