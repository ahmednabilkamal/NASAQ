import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WeightSliderProps {
    weightKg: number;
    unit: 'kg' | 'lbs';
    panHandlers: object;
    trackWidth: number;
}

function WeightSliderInner({ weightKg, unit, panHandlers, trackWidth }: WeightSliderProps) {
    const minWeightKg = 40;
    const maxWeightKg = 120;
    const pointerHalf = 10;

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
                    <View style={styles.trackBg} pointerEvents="none" />
                    <View style={[styles.trackFill, { width: Math.max(0, clampedRatio * trackWidth) }]} pointerEvents="none" />
                    <View style={styles.rulerNumbers} pointerEvents="none">
                        {marks.map((n) => (
                            <Text key={n} style={styles.rulerNumber}>
                                {n}
                            </Text>
                        ))}
                    </View>
                    <View style={[styles.thumb, { left: position }]} pointerEvents="none" />
                </View>
            </View>
        </View>
    );
}

export const WeightSlider = React.memo(WeightSliderInner);

const styles = StyleSheet.create({
    outer: {
        alignSelf: 'center',
    },
    ltrTrack: {
        direction: 'ltr',
    },
    rulerContainer: {
        height: 88,
        justifyContent: 'flex-end',
        paddingBottom: 8,
        paddingTop: 10,
        position: 'relative',
    },
    trackBg: {
        position: 'absolute',
        bottom: 34,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
    },
    trackFill: {
        position: 'absolute',
        bottom: 34,
        left: 0,
        height: 6,
        backgroundColor: '#064E3B',
        borderRadius: 3,
        maxWidth: '100%',
    },
    rulerNumbers: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        position: 'absolute',
        bottom: 2,
        paddingHorizontal: 2,
    },
    rulerNumber: {
        fontSize: 12,
        color: '#6b7280',
        fontFamily: 'Cairo_400Regular',
    },
    thumb: {
        position: 'absolute',
        bottom: 26,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#064E3B',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
    },
});
