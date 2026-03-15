import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontSizes } from '@/utils/typography';

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
}

export const BMISection: React.FC<BMISectionProps> = ({ title, categories, weight, unit }) => {
    const calculatePointerPosition = () => {
        const h = 1.7;
        const w = unit === 'lbs' ? weight * 0.453592 : weight;
        const bmi = w / (h * h);

        const minBMI = 15;
        const maxBMI = 30;
        const percentage = Math.max(0, Math.min(100, ((maxBMI - bmi) / (maxBMI - minBMI)) * 100));
        return `${percentage}%` as any;
    };

    return (
        <View style={styles.bmiSection}>
            <Text style={styles.bmiTitle}>{title}</Text>
            <View style={styles.bmiScale}>
                <View style={[styles.bmiSegment, { backgroundColor: '#FFD700', borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }]}>
                    <Text style={styles.bmiLabel}>30</Text>
                </View>
                <View style={[styles.bmiSegment, { backgroundColor: '#FF8C00' }]}>
                    <Text style={styles.bmiLabel}>25</Text>
                </View>
                <View style={[styles.bmiSegment, { backgroundColor: '#90EE90' }]}>
                    <Text style={styles.bmiLabel}>20</Text>
                </View>
                <View style={[styles.bmiSegment, { backgroundColor: '#DDA0DD', borderTopRightRadius: 5, borderBottomRightRadius: 5 }]}>
                    <Text style={styles.bmiLabel}>15</Text>
                </View>
                <View style={[styles.bmiPointer, { left: calculatePointerPosition() }]} />
            </View>
            <View style={styles.bmiSubLabels}>
                <Text style={styles.bmiSubLabel}>{categories.obese}</Text>
                <Text style={styles.bmiSubLabel}>{categories.overweight}</Text>
                <Text style={styles.bmiSubLabel}>{categories.normal}</Text>
                <Text style={styles.bmiSubLabel}>{categories.underweight}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bmiSection: {
        width: '100%',
        marginBottom: 60,
    },
    bmiTitle: {
        fontSize: FontSizes.body,
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
        fontSize: FontSizes.caption,
        position: 'absolute',
        top: -15,
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
    },
    bmiSubLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    bmiSubLabel: {
        fontSize: FontSizes.caption,
        color: '#999',
        width: '25%',
        textAlign: 'center',
    },
});
