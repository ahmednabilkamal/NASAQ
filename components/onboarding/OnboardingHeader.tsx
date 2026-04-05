import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';

interface OnboardingHeaderProps {
    /** Current progress step (1-based). Omit or set 0 to hide progress bar. */
    currentStep?: number;
    /** Total number of steps. */
    totalSteps?: number;
    /** Called when the back button (RTL right side) is pressed. */
    onBack: () => void;
    /** Called when the close button (RTL left side) is pressed. Defaults to onBack. */
    onClose?: () => void;
    /** Use tighter padding for measurement screens. */
    compact?: boolean;
}

export default function OnboardingHeader({
    currentStep = 0,
    totalSteps = 0,
    onBack,
    onClose,
    compact = false,
}: OnboardingHeaderProps) {
    const showProgress = totalSteps > 0 && currentStep > 0;

    return (
        <View style={[styles.header, compact && styles.headerCompact]}>
            {/* RTL: first child = RIGHT = back */}
            <TouchableOpacity onPress={onBack} style={styles.headerButton}>
                <View style={styles.iconCircle}>
                    <Ionicons name={getBackChevron()} size={24} color="#000" />
                </View>
            </TouchableOpacity>

            {showProgress ? (
                <View style={styles.progressContainer}>
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.progressSegment,
                                index < currentStep
                                    ? styles.progressActive
                                    : styles.progressInactive,
                            ]}
                        />
                    ))}
                </View>
            ) : (
                <View style={styles.progressContainer} />
            )}

            {/* RTL: last child = LEFT = close */}
            <TouchableOpacity onPress={onClose ?? onBack} style={styles.headerButton}>
                <View style={styles.iconCircle}>
                    <Ionicons name="close-outline" size={24} color="#000" />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerCompact: {
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
    progressActive: {
        backgroundColor: '#000',
    },
    progressInactive: {
        backgroundColor: '#E0E0E0',
    },
});
