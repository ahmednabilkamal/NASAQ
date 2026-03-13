import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WeightSliderProps {
    weight: number;
    panHandlers: any;
}

export const WeightSlider: React.FC<WeightSliderProps> = ({ weight, panHandlers }) => {
    const minWeight = 40;
    const maxWeight = 120;
    const sliderWidth = 300;

    const position = ((weight - minWeight) / (maxWeight - minWeight)) * sliderWidth;

    const marks = [40, 60, 80, 100, 120];

    return (
        <View style={styles.rulerContainer} {...panHandlers}>
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
        width: 300,
        height: 100,
        justifyContent: 'center',
        position: 'relative',
        alignSelf: 'center',
    },
    rulerLine: {
        position: 'absolute',
        bottom: 40,
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
        bottom: 10,
    },
    rulerNumber: {
        fontSize: 16,
        color: '#999',
    },
    activePointer: {
        position: 'absolute',
        bottom: 25,
        width: 4,
        height: 40,
        backgroundColor: '#DDA0DD',
        borderRadius: 2,
    }
});
