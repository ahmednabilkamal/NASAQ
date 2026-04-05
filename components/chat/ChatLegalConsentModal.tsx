import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { setUserAcceptedChatLegal } from '@/utils/chatLegalConsent';
import { rtlText } from '@/config/rtlText';

type Props = {
    visible: boolean;
    onClose: () => void;
    /** Called after the user accepts and consent is persisted. */
    onAccepted: () => void | Promise<void>;
};

export function ChatLegalConsentModal({ visible, onClose, onAccepted }: Props) {
    const router = useRouter();
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!visible) {
            setAgreed(false);
            setSubmitting(false);
        }
    }, [visible]);

    const openTerms = useCallback(() => {
        router.push(ROUTES.settings.terms as any);
    }, [router]);

    const openPrivacy = useCallback(() => {
        router.push(ROUTES.settings.privacy as any);
    }, [router]);

    const handleAccept = async () => {
        if (!agreed || submitting) return;
        setSubmitting(true);
        try {
            await setUserAcceptedChatLegal();
            await onAccepted();
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View style={styles.card} onStartShouldSetResponder={() => true}>
                    <Text style={styles.title}>الموافقة على استخدام المحادثة</Text>
                    <ScrollView
                        style={styles.scroll}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.body}>
                            لاستخدام المراسلة مع المنسقات، يرجى الموافقة على{' '}
                            <Text style={styles.linkInline} onPress={openTerms}>
                                الشروط والأحكام
                            </Text>
                            {' و'}
                            <Text style={styles.linkInline} onPress={openPrivacy}>
                                سياسة الخصوصية
                            </Text>
                            {' '}واتفاقية ترخيص المستخدم (EULA) الخاصة بالتطبيق. تتضمن الموافقة الالتزام بعدم إساءة
                            الاستخدام واحترام خصوصية الطرف الآخر.
                        </Text>
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.checkRow}
                        onPress={() => setAgreed((v) => !v)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={agreed ? 'checkbox' : 'square-outline'}
                            size={22}
                            color={agreed ? '#064E3B' : '#9CA3AF'}
                        />
                        <Text style={styles.checkLabel}>أقر بأنني قرأتُ وأوافق على ما سبق</Text>
                    </TouchableOpacity>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.btnSecondary} onPress={onClose} disabled={submitting}>
                            <Text style={styles.btnSecondaryText}>إلغاء</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnPrimary, (!agreed || submitting) && styles.btnPrimaryDisabled]}
                            onPress={handleAccept}
                            disabled={!agreed || submitting}
                        >
                            <Text style={styles.btnPrimaryText}>متابعة</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
        ...rtlText.alignStart,
    },
    title: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 17,
        color: '#111',
        marginBottom: 12,
        ...rtlText.alignStart,
    },
    scroll: {
        maxHeight: 220,
        marginBottom: 12,
    },
    body: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#374151',
        lineHeight: 22,
        ...rtlText.alignStart,
    },
    linkInline: {
        color: '#064E3B',
        fontFamily: 'Cairo_700Bold',
        textDecorationLine: 'underline',
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    checkLabel: {
        flex: 1,
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#333',
        ...rtlText.alignStart,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'flex-end',
    },
    btnSecondary: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },
    btnSecondaryText: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 15,
        color: '#374151',
    },
    btnPrimary: {
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 10,
        backgroundColor: '#064E3B',
    },
    btnPrimaryDisabled: {
        opacity: 0.45,
    },
    btnPrimaryText: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 15,
        color: '#FFF',
    },
});
