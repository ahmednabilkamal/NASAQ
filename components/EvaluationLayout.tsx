import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { onboardingScreenDirection } from '@/config/rtlLayout';
import { rtlWritingMode } from '@/config/rtlText';

export interface EvaluationSecondaryButton {
    label: string;
    onPress: () => void;
    disabled?: boolean;
}

interface EvaluationLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    nextButtonText?: string;
    isNextDisabled?: boolean;
    /** Tighter header + footer so height/weight fit on one screen without scrolling */
    variant?: 'default' | 'measurement';
    /**
     * Explicit back target to avoid relying on navigation history
     * (expo-router `replace()` flows may not have a stack to go back to).
     */
    backRoute?: string;
    /** Optional text button below the primary action (e.g. skip). */
    secondaryButton?: EvaluationSecondaryButton;
}

export default function EvaluationLayout({
    children,
    title,
    subtitle,
    currentStep,
    totalSteps,
    onNext,
    nextButtonText = 'التالي',
    isNextDisabled = false,
    variant = 'default',
    backRoute,
    secondaryButton,
}: EvaluationLayoutProps) {
    const router = useRouter();
    const isMeasurement = variant === 'measurement';

    const handleBack = () => {
        const fallbackBackRoute = (() => {
            switch (currentStep) {
                case 1:
                    return '/pages/onboarding/page3';
                case 2:
                    return '/pages/onboarding/genderSelection';
                case 3:
                    return '/pages/onboarding/heightSelection';
                case 4:
                    return '/pages/onboarding/weightSelection';
                case 5:
                    return '/pages/onboarding/colorSelection';
                case 6:
                    return '/pages/onboarding/bodyShape';
                case 7:
                    return '/pages/onboarding/boyMeasurements';
                default:
                    return '/pages/login';
            }
        })();

        router.replace((backRoute ?? fallbackBackRoute) as any);
    };

    return (
        <SafeAreaView style={[styles.container, onboardingScreenDirection]}>
            <OnboardingHeader
                currentStep={currentStep}
                totalSteps={totalSteps}
                onBack={handleBack}
                compact={isMeasurement}
            />

            {}
            <View style={[styles.content, isMeasurement && styles.contentMeasurement]}>
                <Text style={[styles.title, isMeasurement && styles.titleMeasurement, rtlWritingMode]}>
                    {title}
                </Text>
                {subtitle && (
                    <Text
                        style={[styles.subtitle, isMeasurement && styles.subtitleMeasurement, rtlWritingMode]}
                        numberOfLines={3}
                    >
                        {subtitle}
                    </Text>
                )}
                <View style={[styles.mainContent, isMeasurement && styles.mainContentMeasurement]}>{children}</View>
            </View>

            {}
            <View style={[styles.footer, isMeasurement && styles.footerMeasurement]}>
                <TouchableOpacity
                    style={[styles.nextButton, isNextDisabled && styles.nextButtonDisabled, isMeasurement && styles.nextButtonMeasurement]}
                    onPress={onNext}
                    disabled={isNextDisabled}
                >
                    <Text
                        style={[
                            styles.nextButtonText,
                            isNextDisabled && styles.nextButtonTextDisabled,
                            rtlWritingMode,
                        ]}
                    >
                        {nextButtonText}
                    </Text>
                </TouchableOpacity>
                {secondaryButton ? (
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={secondaryButton.onPress}
                        disabled={secondaryButton.disabled}
                        activeOpacity={0.65}
                    >
                        <Text
                            style={[
                                styles.secondaryButtonText,
                                secondaryButton.disabled && styles.secondaryButtonTextDisabled,
                                rtlWritingMode,
                            ]}
                            suppressHighlighting
                        >
                            {secondaryButton.label}
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
        color: '#000',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Cairo_400Regular',
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
        marginBottom: 30,
    },
    mainContent: {
        flex: 1,
        minHeight: 0,
    },
    mainContentMeasurement: {
        marginTop: 0,
    },
    contentMeasurement: {
        paddingTop: 8,
        paddingHorizontal: 20,
    },
    titleMeasurement: {
        fontSize: 20,
        marginBottom: 4,
    },
    subtitleMeasurement: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 10,
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
    },
    footerMeasurement: {
        paddingTop: 12,
        paddingBottom: 20,
    },
    nextButton: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 50,
        alignItems: 'center',
    },
    nextButtonMeasurement: {
        paddingVertical: 14,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
    },
    nextButtonDisabled: {
        backgroundColor: '#CCC',
    },
    nextButtonTextDisabled: {
        color: '#999',
    },
    secondaryButton: {
        marginTop: 12,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#4B5563',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    secondaryButtonTextDisabled: {
        color: '#C4C4C4',
        textDecorationLine: 'none',
    },
});
