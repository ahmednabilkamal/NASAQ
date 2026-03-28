import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontSizes } from '@/utils/typography';

interface UnitToggleProps {
    unit: string;
    options: { label: string; value: string }[];
    onSelect: (value: any) => void;
    /** Tighter spacing for measurement onboarding screens */
    compact?: boolean;
}

export const UnitToggle: React.FC<UnitToggleProps> = ({ unit, options, onSelect, compact }) => {
    return (
        <View
            style={[
                styles.toggleContainer,
                compact && styles.toggleContainerCompact,
            ]}
        >
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={[styles.toggleButton, compact && styles.toggleButtonCompact, unit === option.value && styles.toggleButtonActive]}
                    onPress={() => onSelect(option.value)}
                >
                    <Text style={[styles.toggleText, compact && styles.toggleTextCompact, unit === option.value && styles.toggleTextActive]}>
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 25,
        padding: 4,
        width: 160,
        marginBottom: 24,
        alignSelf: 'center',
    },
    toggleContainerCompact: {
        marginBottom: 8,
        padding: 3,
        width: 148,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 21,
    },
    toggleButtonActive: {
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleButtonCompact: {
        paddingVertical: 5,
    },
    toggleText: {
        fontSize: FontSizes.bodyLarge,
        fontFamily: 'Cairo_700Bold',
        color: '#999',
    },
    toggleTextCompact: {
        fontSize: 14,
    },
    toggleTextActive: {
        color: '#000',
    },
});
