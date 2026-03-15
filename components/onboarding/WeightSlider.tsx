import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { scale, scaleVertical } from '@/utils/responsive';
import { FontSizes } from '@/utils/typography';

interface WeightSliderProps {
    weight: number;
    panHandlers: any;
}

export const WeightSlider: React.FC<WeightSliderProps> = ({ weight, panHandlers }) => {
    const { width: screenWidth } = useWindowDimensions();
    const minWeight = 40;
    const maxWeight = 120;
    const sliderWidth = screenWidth * 0.8; // 80% of screen width

    const position = ((weight - minWeight) / (maxWeight - minWeight)) * sliderWidth;

    const marks = [40, 60, 80, 100, 120];

    return (
        <View style={[styles.rulerContainer, { width: sliderWidth }]} {...panHandlers}>
            <View style={styles.rulerLine} pointerEvents="none" />
            <View style={styles.rulerNumbers} pointerEvents="none">
                {marks.map((n) => (
                    <Text key={n} style={styles.rulerNumber}>{n}</Text>
                ))}
            </View>
            <View style={[styles.activePointer, { left: position }]} pointerEvents="none" />
        </View>
    );
};

const styles = StyleSheet.create({
    rulerContainer: {
        height: scaleVertical(100),
        justifyContent: 'center',
        position: 'relative',
        alignSelf: 'center',
    },
    rulerLine: {
        position: 'absolute',
        bottom: scaleVertical(40),
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    rulerNumbers: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        position: 'absolute',
        bottom: scaleVertical(10),
    },
    rulerNumber: {
        fontSize: FontSizes.bodyLarge,
        color: '#999',
    },
    activePointer: {
        position: 'absolute',
        bottom: scaleVertical(25),
        width: scale(4),
        height: scaleVertical(40),
        backgroundColor: '#DDA0DD',
        borderRadius: 2,
    }
});
