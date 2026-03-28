import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WeightSliderProps {
    weightKg: number;
    unit: 'kg' | 'lbs';
    panHandlers: object;
    trackWidth: number;
}

export const WeightSlider: React.FC<WeightSliderProps> = ({ weightKg, unit, panHandlers, trackWidth }) => {
    const minWeightKg = 40;
    const maxWeightKg = 120;
    const pointerHalf = 2;

    const ratio = (weightKg - minWeightKg) / (maxWeightKg - minWeightKg);
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const position = clampedRatio * trackWidth - pointerHalf;

    const marksKg = [40, 60, 80, 100, 120];
    const toDisplay = (kg: number) => (unit === 'lbs' ? kg * 2.20462262 : kg);
    const marks = marksKg.map((kg) => {
        const v = toDisplay(kg);
        return Math.abs(v - Math.round(v)) < 0.01 ? String(Math.round(v)) : v.toFixed(1);
    });

    return (
        <View style={[styles.outer, { width: trackWidth }]}>
            <View style={styles.ltrTrack}>
                <View style={[styles.rulerContainer, { width: trackWidth }]} {...panHandlers}>
                    <View style={styles.rulerLine} pointerEvents="none" />
                    <View style={styles.rulerNumbers} pointerEvents="none">
                        {marks.map((n) => (
                            <Text key={n} style={styles.rulerNumber}>
                                {n}
                            </Text>
                        ))}
                    </View>
                    <View style={[styles.activePointer, { left: position }]} pointerEvents="none" />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outer: {
        alignSelf: 'center',
    },
    ltrTrack: {
        direction: 'ltr',
    },
    rulerContainer: {
        height: 72,
        justifyContent: 'flex-end',
        paddingBottom: 4,
        paddingTop: 6,
        position: 'relative',
    },
    rulerLine: {
        position: 'absolute',
        bottom: 26,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#E0E0E0',
        borderRadius: 1,
    },
    rulerNumbers: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        position: 'absolute',
        bottom: 4,
    },
    rulerNumber: {
        fontSize: 13,
        color: '#999',
        fontFamily: 'Cairo_400Regular',
    },
    activePointer: {
        position: 'absolute',
        bottom: 14,
        width: 4,
        height: 28,
        backgroundColor: '#064E3B',
        borderRadius: 2,
    },
});
