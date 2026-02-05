import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface EvaluationLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    nextButtonText?: string;
}

export default function EvaluationLayout({
    children,
    title,
    subtitle,
    currentStep,
    totalSteps,
    onNext,
    nextButtonText = 'التالي',
}: EvaluationLayoutProps) {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            {}
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

            {}
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                <View style={styles.mainContent}>{children}</View>
            </View>

            {}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                    <Text style={styles.nextButtonText}>{nextButtonText}</Text>
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
    },
    footer: {
        padding: 20,
        paddingBottom: 30,
    },
    nextButton: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 50,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
    },
});
