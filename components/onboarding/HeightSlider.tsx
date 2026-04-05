import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HEIGHT_SLIDER_TRACK_HEIGHT = 176;

interface HeightSliderProps {
    height: number;
    panHandlers: object;
    trackWidth: number;
    unit?: 'cm' | 'ft';
    minCm?: number;
    maxCm?: number;
}

function HeightSliderInner({
    height,
    panHandlers,
    trackWidth,
    unit = 'cm',
    minCm = 140,
    maxCm = 190,
}: HeightSliderProps) {
    const pointerHalf = 10;
    const ratio = (height - minCm) / (maxCm - minCm);
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const position = clampedRatio * trackWidth - pointerHalf;

    const marksCm = [140, 150, 160, 170, 180, 190];
    const toDisplay = (cm: number) => {
        if (unit === 'ft') {
            const totalIn = cm / 2.54;
            const ft = Math.floor(totalIn / 12);
            const inch = Math.round(totalIn - ft * 12);
            return `${ft}'${inch}"`;
        }
        return String(cm);
    };

    return (
        <View style={[styles.outer, { width: trackWidth }]}>
            <View style={styles.ltrTrack}>
                <View style={[styles.rulerContainer, { width: trackWidth }]} {...panHandlers}>
                    <View style={styles.trackBg} pointerEvents="none" />
                    <View style={[styles.trackFill, { width: Math.max(0, clampedRatio * trackWidth) }]} pointerEvents="none" />
                    <View style={styles.rulerNumbers} pointerEvents="none">
                        {marksCm.map((cm) => (
                            <Text key={cm} style={styles.rulerNumber}>
                                {toDisplay(cm)}
                            </Text>
                        ))}
                    </View>
                    <View style={[styles.thumb, { left: position }]} pointerEvents="none" />
                </View>
            </View>
        </View>
    );
}

export const HeightSlider = React.memo(HeightSliderInner);

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
        paddingHorizontal: 0,
    },
    rulerNumber: {
        fontSize: 11,
        color: '#6b7280',
        fontFamily: 'Cairo_400Regular',
        maxWidth: 44,
        textAlign: 'center',
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
