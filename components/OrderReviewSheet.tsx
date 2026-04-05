import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { rtlText } from '@/config/rtlText';
import apiService from '@/config/apiService';

const GREEN = '#064E3B';
const STAR_SIZE = 40;
const STAR_GAP = 10;
const STAR_FILLED = '#F59E0B';
const STAR_EMPTY = '#D1D5DB';

type Props = {
    visible: boolean;
    stylistId: number;
    stylistName?: string;
    onClose: () => void;
    onSubmitted: () => void;
};

const STAR_LABELS = ['', 'ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];

export function OrderReviewSheet({ visible, stylistId, stylistName, onClose, onSubmitted }: Props) {
    const insets = useSafeAreaInsets();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (visible) {
            setRating(0);
            setComment('');
            setDone(false);
        }
    }, [visible]);

    const submit = async () => {
        if (rating < 1 || !stylistId) return;
        setSubmitting(true);
        try {
            await apiService.createReview({
                stylist_id: stylistId,
                rating,
                comment: comment.trim() || undefined,
            });
            setDone(true);
            setTimeout(() => {
                setDone(false);
                setRating(0);
                setComment('');
                onSubmitted();
                onClose();
            }, 1500);
        } catch {
            /* toast */
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                    {done ? (
                        <View style={styles.doneBox}>
                            <Ionicons name="checkmark-circle" size={56} color={GREEN} style={styles.doneIcon} />
                            <Text style={styles.doneText}>شكراً لمشاركتك رأيك</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.handle} />
                            <Text style={styles.title}>قيّم تجربتك</Text>
                            <Text style={styles.subtitle}>{stylistName}</Text>
                            <Text style={styles.question}>اختر عدد النجوم من ١ إلى ٥</Text>

                            <View style={styles.starsRow} accessibilityRole="radiogroup">
                                {[1, 2, 3, 4, 5].map((value) => {
                                    const filled = rating >= value;
                                    return (
                                        <TouchableOpacity
                                            key={value}
                                            style={[styles.starHit, rating === value && styles.starHitSelected]}
                                            onPress={() => setRating(value)}
                                            activeOpacity={0.75}
                                            accessibilityRole="radio"
                                            accessibilityState={{ checked: rating === value }}
                                            accessibilityLabel={`${value} من 5`}
                                        >
                                            <Ionicons
                                                name={filled ? 'star' : 'star-outline'}
                                                size={STAR_SIZE}
                                                color={filled ? STAR_FILLED : STAR_EMPTY}
                                            />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {rating > 0 ? (
                                <Text style={styles.ratingHint}>{STAR_LABELS[rating]}</Text>
                            ) : (
                                <Text style={styles.ratingHintMuted}>اضغط على النجوم للتقييم</Text>
                            )}

                            <TextInput
                                style={styles.input}
                                placeholder="اكتب رأيك هنا (اختياري)..."
                                placeholderTextColor="#9CA3AF"
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                textAlignVertical="top"
                            />

                            <TouchableOpacity
                                style={[styles.submitBtn, rating < 1 && styles.submitBtnOff]}
                                onPress={submit}
                                disabled={rating < 1 || submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.submitText}>إرسال التقييم</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 22,
        paddingTop: 10,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E5E7EB',
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 18,
        color: '#111',
        textAlign: 'center',
        marginBottom: 8,
        ...rtlText.alignStart,
    },
    subtitle: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 12,
    },
    question: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#374151',
        textAlign: 'center',
        marginBottom: 14,
        ...rtlText.alignStart,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        gap: STAR_GAP,
    },
    starHit: {
        padding: 6,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    starHitSelected: {
        borderColor: 'rgba(245, 158, 11, 0.35)',
        backgroundColor: '#FFFBEB',
    },
    ratingHint: {
        fontFamily: 'Cairo_600SemiBold',
        fontSize: 15,
        color: STAR_FILLED,
        textAlign: 'center',
        marginBottom: 14,
        ...rtlText.alignStart,
    },
    ratingHintMuted: {
        fontFamily: 'Cairo_400Regular',
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 14,
        ...rtlText.alignStart,
    },
    input: {
        minHeight: 100,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 14,
        fontFamily: 'Cairo_400Regular',
        fontSize: 14,
        color: '#111',
        marginBottom: 12,
        ...rtlText.alignStart,
    },
    submitBtn: {
        backgroundColor: GREEN,
        borderRadius: 28,
        paddingVertical: 14,
        alignItems: 'center',
    },
    submitBtnOff: {
        opacity: 0.45,
    },
    submitText: {
        color: '#FFF',
        fontFamily: 'Cairo_700Bold',
        fontSize: 16,
        ...rtlText.alignStart,
    },
    doneBox: {
        paddingVertical: 28,
        alignItems: 'center',
    },
    doneIcon: {
        marginBottom: 12,
    },
    doneText: {
        fontFamily: 'Cairo_700Bold',
        fontSize: 17,
        color: GREEN,
        textAlign: 'center',
        ...rtlText.alignStart,
    },
});
