import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import { useAuth } from '@/config/authContext';
import Toast from 'react-native-toast-message';

const CONFIRM_WORD = 'حذف';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { deleteAccount } = useAuth();
  const [understood, setUnderstood] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const typedCorrectly = confirmText.trim() === CONFIRM_WORD;
  const canSubmit = understood && typedCorrectly && !loading;

  const onDelete = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await deleteAccount();
      Toast.show({ type: 'success', text1: 'تم', text2: 'تم حذف حسابك' });
      router.replace('/pages/login');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        (typeof e?.message === 'string' ? e.message : 'تعذر حذف الحساب');
      Toast.show({ type: 'error', text1: 'خطأ', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, userScreenDirection]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name={getBackChevron()} size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>حذف الحساب</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.warnBanner}>
            <Ionicons name="warning" size={28} color="#B45309" />
            <Text style={styles.warnTitle}>منطقة خطرة</Text>
            <Text style={styles.warnBody}>
              سيتم إلغاء الوصول إلى حسابك فوراً. قد تُحذف أو تُخفى بياناتك وفق سياسة التطبيق، ولن يمكن
              استرجاع المحادثات والطلبات المرتبطة بهذا الحساب.
            </Text>
          </View>

          <View style={styles.bullets}>
            <Text style={styles.bullet}>• سجّل الخروج من جميع الأجهزة بعد الحذف.</Text>
            <Text style={styles.bullet}>• إن كنت منسّقاً، سيُوقف ظهور ملفك للعملاء.</Text>
            <Text style={styles.bullet}>• لا يمكن التراجع عن هذا الإجراء من التطبيق.</Text>
          </View>

          <TouchableOpacity
            style={[styles.checkRow, understood && styles.checkRowOn]}
            onPress={() => setUnderstood(!understood)}
            activeOpacity={0.85}
          >
            <View style={[styles.checkbox, understood && styles.checkboxOn]}>
              {understood ? <Ionicons name="checkmark" size={18} color="#FFF" /> : null}
            </View>
            <Text style={styles.checkLabel}>
              أقرّ بأنني قرأتُ التحذيرات وأفهم أن حذف الحساب نهائي ولا يمكن التراجع عنه من التطبيق.
            </Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>للتأكيد، اكتب كلمة «{CONFIRM_WORD}» بالضبط كما هي:</Text>
          <TextInput
            style={[styles.input, rtlText.alignStart]}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder={CONFIRM_WORD}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {confirmText.length > 0 && !typedCorrectly ? (
            <Text style={styles.hintError}>يجب أن تطابق الكلمة حرفياً: {CONFIRM_WORD}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.deleteBtn, !canSubmit && styles.deleteBtnDisabled]}
            onPress={onDelete}
            disabled={!canSubmit}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={22} color="#FFF" />
                <Text style={styles.deleteBtnText}>حذف حسابي نهائياً</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelLink} onPress={() => router.back()} disabled={loading}>
            <Text style={styles.cancelLinkText}>العودة والإبقاء على الحساب</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FB' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Cairo_700Bold',
    color: '#111',
    ...rtlText.alignCenter,
  },
  headerSpacer: { width: 40 },
  scroll: { padding: 20, paddingBottom: 40 },
  warnBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  warnTitle: {
    fontSize: 17,
    fontFamily: 'Cairo_700Bold',
    color: '#92400E',
    marginTop: 8,
    marginBottom: 8,
    ...rtlText.alignStart,
  },
  warnBody: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: '#78350F',
    lineHeight: 22,
    ...rtlText.alignStart,
  },
  bullets: { marginBottom: 18, gap: 8 },
  bullet: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: '#374151',
    lineHeight: 22,
    ...rtlText.alignStart,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    marginBottom: 20,
  },
  checkRowOn: { borderColor: '#064E3B', backgroundColor: '#F0FDF4' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxOn: { backgroundColor: '#064E3B', borderColor: '#064E3B' },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Cairo_600SemiBold',
    color: '#111',
    lineHeight: 22,
    ...rtlText.alignStart,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Cairo_700Bold',
    color: '#111',
    marginBottom: 8,
    ...rtlText.alignStart,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Cairo_600SemiBold',
    color: '#111',
    marginBottom: 8,
  },
  hintError: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: '#DC2626',
    marginBottom: 16,
    ...rtlText.alignStart,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B91C1C',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  deleteBtnDisabled: { opacity: 0.45 },
  deleteBtnText: {
    fontSize: 16,
    fontFamily: 'Cairo_700Bold',
    color: '#FFF',
  },
  cancelLink: { marginTop: 20, alignItems: 'center', paddingVertical: 12 },
  cancelLinkText: {
    fontSize: 15,
    fontFamily: 'Cairo_600SemiBold',
    color: '#064E3B',
  },
});
