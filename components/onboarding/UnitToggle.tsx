import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface UnitToggleProps {
    unit: string;
    options: { label: string; value: string }[];
    onSelect: (value: any) => void;
}

export const UnitToggle: React.FC<UnitToggleProps> = ({ unit, options, onSelect }) => {
    return (
        <View style={styles.toggleContainer}>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={[styles.toggleButton, unit === option.value && styles.toggleButtonActive]}
                    onPress={() => onSelect(option.value)}
                >
                    <Text style={[styles.toggleText, unit === option.value && styles.toggleTextActive]}>
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
        marginBottom: 40,
        alignSelf: 'center',
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
    toggleText: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#999',
    },
    toggleTextActive: {
        color: '#000',
    },
});
