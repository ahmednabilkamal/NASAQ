import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BMISectionProps {
    title: string;
    categories: {
        obese: string;
        overweight: string;
        normal: string;
        underweight: string;
    };
    weight: number;
    unit: 'kg' | 'lbs';
    /**
     * Height in centimeters from the onboarding height step.
     * BMI pointer depends on it.
     */
    heightCm: number;
    compact?: boolean;
}

export const BMISection: React.FC<BMISectionProps> = ({ title, categories, weight, unit, heightCm, compact }) => {
    const calculatePointerPosition = () => {
        const h = (heightCm || 170) / 100; // convert cm -> meters
        const w = unit === 'lbs' ? weight * 0.453592 : weight;
        const bmi = w / (h * h);

        const minBMI = 15;
        const maxBMI = 30;
        const percentage = Math.max(0, Math.min(100, ((maxBMI - bmi) / (maxBMI - minBMI)) * 100));
        return `${percentage}%` as any;
    };

    return (
        <View style={[styles.bmiSection, compact && styles.bmiSectionCompact]}>
            <Text style={[styles.bmiTitle, compact && styles.bmiTitleCompact]} numberOfLines={2}>
                {title}
            </Text>
            <View style={styles.bmiScaleLtr}>
            <View style={[styles.bmiScale, compact && styles.bmiScaleCompact]}>
                <View style={[styles.bmiSegment, { backgroundColor: '#FFD700', borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }]}>
                    <Text style={[styles.bmiLabel, compact && styles.bmiLabelCompact]}>30</Text>
                </View>
                <View style={[styles.bmiSegment, { backgroundColor: '#FF8C00' }]}>
                    <Text style={[styles.bmiLabel, compact && styles.bmiLabelCompact]}>25</Text>
                </View>
                <View style={[styles.bmiSegment, { backgroundColor: '#90EE90' }]}>
                    <Text style={[styles.bmiLabel, compact && styles.bmiLabelCompact]}>20</Text>
                </View>
                <View style={[styles.bmiSegment, { backgroundColor: '#DDA0DD', borderTopRightRadius: 5, borderBottomRightRadius: 5 }]}>
                    <Text style={[styles.bmiLabel, compact && styles.bmiLabelCompact]}>15</Text>
                </View>
                <View style={[styles.bmiPointer, { left: calculatePointerPosition() }]} />
            </View>
            <View style={[styles.bmiSubLabels, compact && styles.bmiSubLabelsCompact]}>
                <Text style={[styles.bmiSubLabel, compact && styles.bmiSubLabelCompact]} numberOfLines={1}>
                    {categories.obese}
                </Text>
                <Text style={[styles.bmiSubLabel, compact && styles.bmiSubLabelCompact]} numberOfLines={1}>
                    {categories.overweight}
                </Text>
                <Text style={[styles.bmiSubLabel, compact && styles.bmiSubLabelCompact]} numberOfLines={1}>
                    {categories.normal}
                </Text>
                <Text style={[styles.bmiSubLabel, compact && styles.bmiSubLabelCompact]} numberOfLines={1}>
                    {categories.underweight}
                </Text>
            </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bmiSection: {
        width: '100%',
        marginBottom: 20,
    },
    bmiScaleLtr: {
        direction: 'ltr',
        width: '100%',
    },
    bmiTitle: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    bmiScale: {
        flexDirection: 'row',
        height: 10,
        width: '100%',
        position: 'relative',
    },
    bmiSegment: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bmiLabel: {
        fontSize: 10,
        position: 'absolute',
        top: -15,
    },
    bmiLabelCompact: {
        fontSize: 9,
        top: -12,
    },
    bmiPointer: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#000',
        borderWidth: 2,
        borderColor: '#FFF',
        top: -1,
        zIndex: 10,
        marginLeft: -6,
    },
    bmiSubLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    bmiSubLabel: {
        fontSize: 10,
        color: '#999',
        width: '25%',
        textAlign: 'center',
    },
    bmiSectionCompact: {
        marginBottom: 12,
    },
    bmiTitleCompact: {
        fontSize: 12,
        marginBottom: 6,
        lineHeight: 16,
    },
    bmiScaleCompact: {
        height: 8,
    },
    bmiSubLabelsCompact: {
        marginTop: 6,
    },
    bmiSubLabelCompact: {
        fontSize: 8,
    },
});
