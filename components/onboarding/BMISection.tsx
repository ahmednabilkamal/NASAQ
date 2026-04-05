import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BMISectionProps {
    /** Short neutral intro (not a fixed category sentence). */
    intro: string;
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

function bmiCategoryLabel(
    bmi: number,
    categories: BMISectionProps['categories'],
): string {
    if (bmi < 18.5) return categories.underweight;
    if (bmi < 25) return categories.normal;
    if (bmi < 30) return categories.overweight;
    return categories.obese;
}

export const BMISection = React.memo(function BMISection({
    intro,
    categories,
    weight,
    unit,
    heightCm,
    compact,
}: BMISectionProps) {
    const bmi = useMemo(() => {
        const h = (heightCm || 170) / 100;
        const wKg = unit === 'lbs' ? weight * 0.453592 : weight;
        if (h <= 0 || wKg <= 0) return 22;
        return wKg / (h * h);
    }, [heightCm, weight, unit]);

    const bmiDisplay = Math.round(bmi * 10) / 10;
    const categoryLine = useMemo(
        () => bmiCategoryLabel(bmi, categories),
        [bmi, categories],
    );

    const pointerLeft = useMemo(() => {
        const minBMI = 15;
        const maxBMI = 35;
        const percentage = Math.max(0, Math.min(100, ((maxBMI - bmi) / (maxBMI - minBMI)) * 100));
        return `${percentage}%` as const;
    }, [bmi]);

    return (
        <View style={[styles.bmiSection, compact && styles.bmiSectionCompact]}>
            <Text style={[styles.bmiIntro, compact && styles.bmiIntroCompact]} numberOfLines={3}>
                {intro}
            </Text>
            <Text style={[styles.bmiCategoryLine, compact && styles.bmiCategoryLineCompact]} numberOfLines={2}>
                {categoryLine} · BMI {bmiDisplay}
            </Text>
            <View style={styles.bmiScaleLtr}>
            <View style={[styles.bmiScale, compact && styles.bmiScaleCompact]}>
                <View style={[styles.bmiSegment, { backgroundColor: '#FFD700', borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]}>
                    <Text style={[styles.bmiLabel, compact && styles.bmiLabelCompact]}>30</Text>
                </View>
                <View style={[styles.bmiSegment, { backgroundColor: '#FF8C00' }]}>
                    <Text style={[styles.bmiLabel, compact && styles.bmiLabelCompact]}>25</Text>
                </View>
                <View style={[styles.bmiSegment, { backgroundColor: '#86EFAC' }]}>
                    <Text style={[styles.bmiLabel, compact && styles.bmiLabelCompact]}>20</Text>
                </View>
                <View style={[styles.bmiSegment, { backgroundColor: '#C4B5FD', borderTopRightRadius: 6, borderBottomRightRadius: 6 }]}>
                    <Text style={[styles.bmiLabel, compact && styles.bmiLabelCompact]}>15</Text>
                </View>
                <View style={[styles.bmiPointer, { left: pointerLeft }]} />
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
});

const styles = StyleSheet.create({
    bmiSection: {
        width: '100%',
        marginBottom: 16,
    },
    bmiScaleLtr: {
        direction: 'ltr',
        width: '100%',
    },
    bmiIntro: {
        fontSize: 13,
        fontFamily: 'Cairo_400Regular',
        textAlign: 'center',
        color: '#4b5563',
        lineHeight: 19,
        marginBottom: 6,
    },
    bmiIntroCompact: {
        fontSize: 12,
        lineHeight: 17,
        marginBottom: 4,
    },
    bmiCategoryLine: {
        fontSize: 15,
        fontFamily: 'Cairo_700Bold',
        textAlign: 'center',
        color: '#111827',
        marginBottom: 12,
    },
    bmiCategoryLineCompact: {
        fontSize: 13,
        marginBottom: 8,
    },
    bmiScale: {
        flexDirection: 'row',
        height: 12,
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
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#064E3B',
        borderWidth: 2,
        borderColor: '#FFF',
        top: -2,
        zIndex: 10,
        marginStart: -7,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
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
        marginBottom: 10,
    },
    bmiScaleCompact: {
        height: 10,
    },
    bmiSubLabelsCompact: {
        marginTop: 6,
    },
    bmiSubLabelCompact: {
        fontSize: 8,
    },
});
