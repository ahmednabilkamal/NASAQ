import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';

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
}: EvaluationLayoutProps) {
    const router = useRouter();
    const isMeasurement = variant === 'measurement';

    const handleBack = () => {
        const fallbackBackRoute = (() => {
            // These routes match how onboarding pages transition via `router.push()`.
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
                    return '/pages/onboarding/bodyMeasurement';
                default:
                    return '/pages/login';
            }
        })();

        // Use deterministic route navigation instead of stack back.
        router.replace((backRoute ?? fallbackBackRoute) as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            {}
            <View style={[styles.header, isMeasurement && styles.headerMeasurement]}>
                <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="close-outline" size={24} color="#000" />
                    </View>
                </TouchableOpacity>

                <View style={styles.progressContainer}>
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.progressSegment,
                                index < currentStep ? styles.progressSegmentActive : styles.progressSegmentInactive,
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                    <View style={styles.iconCircle}>
                        <Ionicons name={getBackChevron()} size={24} color="#000" />
                    </View>
                </TouchableOpacity>
            </View>

            {}
            <View style={[styles.content, isMeasurement && styles.contentMeasurement]}>
                <Text style={[styles.title, isMeasurement && styles.titleMeasurement]}>{title}</Text>
                {subtitle && (
                    <Text
                        style={[styles.subtitle, isMeasurement && styles.subtitleMeasurement]}
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
                    <Text style={[styles.nextButtonText, isNextDisabled && styles.nextButtonTextDisabled]}>
                        {nextButtonText}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerMeasurement: {
        paddingVertical: 8,
    },
    headerButton: {
        padding: 5,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: 4,
        flex: 1,
        marginHorizontal: 15,
        justifyContent: 'center',
    },
    progressSegment: {
        height: 4,
        flex: 1,
        borderRadius: 2,
    },
    progressSegmentActive: {
        backgroundColor: '#000',
    },
    progressSegmentInactive: {
        backgroundColor: '#E0E0E0',
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
    },
    nextButtonDisabled: {
        backgroundColor: '#CCC',
    },
    nextButtonTextDisabled: {
        color: '#999',
    },
});
