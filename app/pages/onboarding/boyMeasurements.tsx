import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import EvaluationLayout from '@/components/EvaluationLayout';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { useAuth } from '@/config/authContext';
import { onboardingScreenDirection } from '@/config/rtlLayout';
import { rtlText, rtlWritingMode } from '@/config/rtlText';
import { useOnboardingProgress } from '@/hooks/onboarding/useOnboardingProgress';
import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';

type MeasurementKey = 'shoulder' | 'chest' | 'waist' | 'arm' | 'hip' | 'thigh' | 'leg';

const KEYS: MeasurementKey[] = ['shoulder', 'chest', 'waist', 'arm', 'hip', 'thigh', 'leg'];

const ICONS: Record<MeasurementKey, React.ComponentProps<typeof Ionicons>['name']> = {
    shoulder: 'body-outline',
    chest: 'shirt-outline',
    waist: 'resize-outline',
    arm: 'hand-left-outline',
    hip: 'man-outline',
    thigh: 'walk-outline',
    leg: 'footsteps-outline',
};

function emptyFields(): Record<MeasurementKey, string> {
    return { shoulder: '', chest: '', waist: '', arm: '', hip: '', thigh: '', leg: '' };
}

function MeasurementRow({
    measurementKey,
    index,
    label,
    hint,
    placeholder,
    value,
    onChange,
    onSubmit,
    inputRef,
}: {
    measurementKey: MeasurementKey;
    index: number;
    label: string;
    hint: string;
    placeholder: string;
    value: string;
    onChange: (key: MeasurementKey, text: string) => void;
    onSubmit: () => void;
    inputRef: React.RefObject<TextInput | null>;
}) {
    const [focused, setFocused] = useState(false);

    const n = Number(value.replace(',', '.'));
    const filled = value.length > 0;
    const valid = !filled || (!Number.isNaN(n) && n >= 15 && n <= 250);

    const rowBorder = !valid ? styles.cardInvalid : focused ? styles.cardFocused : styles.cardIdle;

    return (
        <TouchableOpacity activeOpacity={0.92} onPress={() => inputRef.current?.focus()}>
            <View style={[styles.card, rowBorder, filled && valid && styles.cardComplete]}>
                <View style={styles.indexBadge}>
                    <Text style={styles.indexBadgeText}>{index}</Text>
                </View>

                <View style={[styles.iconCircle, focused && styles.iconCircleFocused]}>
                    <Ionicons name={ICONS[measurementKey]} size={20} color={focused ? '#FFF' : '#064E3B'} />
                </View>

                <View style={styles.cardBody}>
                    <Text style={[styles.label, rtlText.alignStart, rtlWritingMode]}>{label}</Text>
                    <Text style={[styles.hint, rtlText.alignStart, rtlWritingMode]} numberOfLines={2}>
                        {hint}
                    </Text>
                </View>

                <View style={[styles.inputBox, focused && styles.inputBoxFocused, !valid && styles.inputBoxError]}>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        value={value}
                        onChangeText={(t) => onChange(measurementKey, t)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        onSubmitEditing={onSubmit}
                        keyboardType="decimal-pad"
                        returnKeyType="next"
                        placeholder={placeholder}
                        placeholderTextColor="#C9CDD3"
                        maxLength={6}
                        selectTextOnFocus
                    />
                    <Text style={[styles.suffix, focused && styles.suffixFocused]}>cm</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function BoyMeasurementsPage() {
    const router = useRouter();
    const { languageCode } = useLanguage();
    const content =
        (pageData as any)[languageCode]?.boyMeasurements || (pageData as any)['ar'].boyMeasurements;
    const labels = content.fields as Record<MeasurementKey, string>;
    const hints = content.hints as Record<MeasurementKey, string>;

    const { user, updateProfile } = useAuth();
    const { currentStep, totalSteps, gender } = useOnboardingProgress('measurements');
    const effectiveGender = gender ?? user?.gender;
    const [fields, setFields] = useState<Record<MeasurementKey, string>>(emptyFields);
    const [saving, setSaving] = useState(false);
    const [skipping, setSkipping] = useState(false);

    const inputRefs = useRef<Record<MeasurementKey, React.RefObject<TextInput | null>>>(
        KEYS.reduce(
            (acc, k) => ({ ...acc, [k]: React.createRef<TextInput | null>() }),
            {} as Record<MeasurementKey, React.RefObject<TextInput | null>>,
        ),
    ).current;

    useEffect(() => {
        if (effectiveGender === 'female') {
            router.replace(ROUTES.onboarding.styleIdentity as any);
        }
    }, [effectiveGender, router]);

    useEffect(() => {
        const m = user?.body_measurements;
        if (!m || typeof m !== 'object') return;
        if (m.skipped === true || m.skipped === 1 || m.skipped === 'true') return;
        setFields((prev) => {
            const next = { ...prev };
            KEYS.forEach((k) => {
                const v = m[k];
                if (v != null && v !== '' && typeof v === 'number') next[k] = String(v);
                if (typeof v === 'string' && v !== '') next[k] = v;
            });
            return next;
        });
    }, [user?.body_measurements]);

    const allValid = useMemo(() => {
        return KEYS.every((k) => {
            const n = Number(fields[k].replace(',', '.'));
            return !Number.isNaN(n) && n >= 15 && n <= 250;
        });
    }, [fields]);

    const filledCount = useMemo(
        () =>
            KEYS.filter((k) => {
                const n = Number(fields[k].replace(',', '.'));
                return !Number.isNaN(n) && n >= 15 && n <= 250;
            }).length,
        [fields],
    );

    const progressLine = useMemo(() => {
        const tpl = (content.progressLine as string) || '{{n}} / {{total}}';
        return tpl.replace('{{n}}', String(filledCount)).replace('{{total}}', String(KEYS.length));
    }, [content.progressLine, filledCount]);

    const setField = (key: MeasurementKey, text: string) => {
        const cleaned = text.replace(/[^0-9.,]/g, '');
        setFields((prev) => ({ ...prev, [key]: cleaned }));
    };

    const focusNext = useCallback(
        (key: MeasurementKey) => {
            const idx = KEYS.indexOf(key);
            if (idx < KEYS.length - 1) {
                inputRefs[KEYS[idx + 1]].current?.focus();
            }
        },
        [inputRefs],
    );

    const goStyleIdentity = () => router.push(ROUTES.onboarding.styleIdentity as any);

    const handleNext = async () => {
        if (!allValid) return;
        setSaving(true);
        try {
            const body_measurements = KEYS.reduce(
                (acc, k) => {
                    acc[k] = Math.round(Number(fields[k].replace(',', '.')) * 10) / 10;
                    return acc;
                },
                {} as Record<MeasurementKey, number>,
            );
            await updateProfile({ body_measurements });
            goStyleIdentity();
        } catch (e) {
            console.error('Failed to save body measurements:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = async () => {
        setSkipping(true);
        try {
            await updateProfile({ body_measurements: { skipped: true } });
            goStyleIdentity();
        } catch (e) {
            console.error('Failed to skip body measurements:', e);
        } finally {
            setSkipping(false);
        }
    };

    if (effectiveGender === 'female') return null;

    const busy = saving || skipping;

    return (
        <View style={[styles.screen, onboardingScreenDirection]}>
            <EvaluationLayout
                variant="measurement"
                title={content.title}
                subtitle={content.subtitle}
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={handleNext}
                isNextDisabled={!allValid || busy}
                nextButtonText={saving ? '...' : content.nextButton}
                backRoute={ROUTES.onboarding.bodyShape}
                secondaryButton={{
                    label: skipping ? content.skipSaving || '...' : content.skipButton,
                    onPress: handleSkip,
                    disabled: busy,
                }}
            >
                <KeyboardAvoidingView
                    style={styles.kavContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                >
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.unitBanner}>
                            <Ionicons name="information-circle-outline" size={18} color="#064E3B" />
                            <Text style={[styles.unitBannerText, rtlText.alignStart, rtlWritingMode]}>
                                {content.unitHint}
                            </Text>
                        </View>

                        <View style={styles.progressChip}>
                            <Ionicons
                                name={allValid ? 'checkmark-circle' : 'ellipse-outline'}
                                size={18}
                                color={allValid ? '#059669' : '#9CA3AF'}
                            />
                            <Text
                                style={[
                                    styles.progressText,
                                    allValid && styles.progressTextDone,
                                    rtlText.alignStart,
                                    rtlWritingMode,
                                ]}
                            >
                                {progressLine}
                            </Text>
                        </View>

                        {KEYS.map((key, i) => (
                            <MeasurementRow
                                key={key}
                                measurementKey={key}
                                index={i + 1}
                                label={labels[key]}
                                hint={hints[key]}
                                placeholder={content.placeholder}
                                value={fields[key]}
                                onChange={setField}
                                onSubmit={() => focusNext(key)}
                                inputRef={inputRefs[key]}
                            />
                        ))}
                    </ScrollView>
                </KeyboardAvoidingView>
            </EvaluationLayout>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    kavContainer: {
        flex: 1,
        minHeight: 0,
    },
    scroll: {
        flex: 1,
        minHeight: 0,
    },
    scrollContent: {
        paddingBottom: 8,
    },

    unitBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    unitBannerText: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        color: '#065F46',
        lineHeight: 19,
    },

    progressChip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        gap: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 14,
    },
    progressText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#6B7280',
    },
    progressTextDone: {
        color: '#059669',
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginBottom: 10,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardIdle: {
        borderColor: '#E5E7EB',
    },
    cardFocused: {
        borderColor: '#064E3B',
        backgroundColor: '#FAFFFE',
    },
    cardInvalid: {
        borderColor: '#F87171',
        backgroundColor: '#FEF2F2',
    },
    cardComplete: {
        borderColor: '#A7F3D0',
    },

    indexBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginEnd: 8,
    },
    indexBadgeText: {
        fontSize: 11,
        fontFamily: 'Cairo_700Bold',
        color: '#4B5563',
    },

    iconCircle: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginEnd: 8,
    },
    iconCircleFocused: {
        backgroundColor: '#064E3B',
    },

    cardBody: {
        flex: 1,
        minWidth: 0,
        paddingEnd: 6,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#111827',
        lineHeight: 20,
    },
    hint: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#9CA3AF',
        marginTop: 2,
        lineHeight: 16,
    },

    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 8,
        minWidth: 88,
        maxWidth: 96,
        height: 46,
    },
    inputBoxFocused: {
        borderColor: '#064E3B',
        backgroundColor: '#F0FDF4',
    },
    inputBoxError: {
        borderColor: '#F87171',
        backgroundColor: '#FFF5F5',
    },
    input: {
        flex: 1,
        minWidth: 0,
        fontSize: 17,
        fontFamily: 'Cairo_700Bold',
        color: '#111827',
        textAlign: 'center',
        paddingVertical: Platform.OS === 'android' ? 4 : 8,
    },
    suffix: {
        fontSize: 11,
        fontFamily: 'Cairo_400Regular',
        color: '#9CA3AF',
    },
    suffixFocused: {
        color: '#064E3B',
        fontFamily: 'Cairo_700Bold',
    },
});
