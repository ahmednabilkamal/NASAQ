import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { onboardingScreenDirection } from '@/config/rtlLayout';
import { rtlText, rtlWritingMode } from '@/config/rtlText';
import { useRouter } from 'expo-router';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';

type Role = 'stylist' | 'client';

export default function RoleSelectionScreen() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const handleStart = () => {
        if (!selectedRole) return;
        if (selectedRole === 'stylist') {
            router.push('/pages/onboarding/stylistProfile' as any);
        } else {
            router.push('/pages/onboarding/genderSelection' as any);
        }
    };

    const handleSkip = () => {
        router.push('/pages/onboarding/genderSelection' as any);
    };

    return (
        <SafeAreaView style={[styles.container, onboardingScreenDirection]}>
            <OnboardingHeader
                onBack={handleSkip}
                onClose={handleSkip}
            />

            <View style={styles.content}>
                <Text style={[styles.title, rtlWritingMode]}>كيف تود أن تكون تجربتك معنا؟</Text>
                <Text style={[styles.subtitle, rtlWritingMode]}>
                    حدّد دورك لنخصّص لك تجربة تناسب احتياجك{'\n'}وتمنحك الأناقة بأسلوبك الخاص.
                </Text>

                <View style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={[styles.optionCard, selectedRole === 'stylist' && styles.optionCardSelected]}
                        onPress={() => setSelectedRole('stylist')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.optionText, rtlWritingMode]}>أنا منسّق أزياء</Text>
                        <View style={[styles.radio, selectedRole === 'stylist' && styles.radioSelected]}>
                            {selectedRole === 'stylist' && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionCard, selectedRole === 'client' && styles.optionCardSelected]}
                        onPress={() => setSelectedRole('client')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.optionText, rtlWritingMode]}>أبغى منسّق يساعدني</Text>
                        <View style={[styles.radio, selectedRole === 'client' && styles.radioSelected]}>
                            {selectedRole === 'client' && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.startButton, !selectedRole && styles.startButtonDisabled]}
                    onPress={handleStart}
                    disabled={!selectedRole}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.startButtonText,
                            !selectedRole && styles.startButtonTextDisabled,
                            rtlWritingMode,
                        ]}
                    >
                        ابدأ
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        marginBottom: 12,
        ...rtlText.alignStart,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        lineHeight: 22,
        marginBottom: 36,
        ...rtlText.alignStart,
    },
    optionsContainer: {
        gap: 14,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    optionCardSelected: {
        borderColor: '#0a7ea4',
        backgroundColor: '#FAFCFF',
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#1A1A1A',
        flex: 1,
        ...rtlText.alignStart,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D0D0D0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: '#0a7ea4',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#0a7ea4',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 34,
        paddingTop: 12,
    },
    startButton: {
        backgroundColor: '#000',
        height: 56,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
    },
    startButtonDisabled: {
        backgroundColor: '#D0D0D0',
    },
    startButtonTextDisabled: {
        color: '#999',
    },
});
