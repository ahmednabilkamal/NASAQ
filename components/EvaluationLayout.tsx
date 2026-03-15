import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';

interface EvaluationLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    nextButtonText?: string;
    isNextDisabled?: boolean;
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
}: EvaluationLayoutProps) {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
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

                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <View style={styles.iconCircle}>
                        <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={24} color="#000" />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                <View style={styles.mainContent}>{children}</View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, isNextDisabled && styles.nextButtonDisabled]}
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
        paddingHorizontal: Spacing.xl,
        paddingVertical: scaleVertical(15),
    },
    headerButton: {
        padding: scale(5),
    },
    iconCircle: {
        width: IconSizes.xxl,
        height: IconSizes.xxl,
        borderRadius: BorderRadius.xxxl,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(1) },
        shadowOpacity: 0.1,
        shadowRadius: scale(2),
        elevation: 2,
    },
    progressContainer: {
        flexDirection: 'row',
        gap: scale(4),
        flex: 1,
        marginHorizontal: scaleVertical(15),
        justifyContent: 'center',
    },
    progressSegment: {
        height: scale(4),
        flex: 1,
        borderRadius: scale(2),
    },
    progressSegmentActive: {
        backgroundColor: '#000',
    },
    progressSegmentInactive: {
        backgroundColor: '#E0E0E0',
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.xxxl,
        paddingTop: scaleVertical(20),
    },
    title: {
        fontSize: FontSizes.h1,
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
        color: '#000',
        marginBottom: scaleVertical(10),
        lineHeight: LineHeights.h1,
    },
    subtitle: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_400Regular',
        textAlign: 'center',
        color: '#666',
        lineHeight: LineHeights.bodyLarge,
        marginBottom: scaleVertical(30),
    },
    mainContent: {
        flex: 1,
    },
    footer: {
        padding: Spacing.xl,
        paddingBottom: scaleVertical(30),
    },
    nextButton: {
        backgroundColor: '#000',
        paddingVertical: scaleVertical(18),
        borderRadius: BorderRadius.button,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: FontSizes.h4,
        fontFamily: 'Cairo_700Bold',
        lineHeight: LineHeights.h4,
    },
    nextButtonDisabled: {
        backgroundColor: '#CCC',
    },
    nextButtonTextDisabled: {
        color: '#999',
    },
});
