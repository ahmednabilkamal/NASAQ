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
    const sliderWidth = screenWidth; // Full screen width

    // Fixed range from 40 to 120 kg
    const minWeight = 40;
    const maxWeight = 120;
    const totalRange = maxWeight - minWeight; // 80 kg range

    // Fixed number marks at intervals (every 20 kg)
    const fixedMarks = [40, 60, 80, 100, 120];

    // Generate wave-like tick marks - one tick per kg
    const tickCount = totalRange; // 80 ticks for 80 kg range
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i);

    // Calculate pointer position based on current weight
    const pointerPosition = ((weight - minWeight) / totalRange) * sliderWidth;

    return (
        <View style={[styles.rulerContainer, { width: sliderWidth }]} {...panHandlers}>
            {/* Wave-like tick marks */}
            <View style={styles.ticksContainer} pointerEvents="none">
                {ticks.map((i) => {
                    const tickPosition = (i / tickCount) * sliderWidth;
                    const weightAtTick = minWeight + i;
                    const isLargeTick = weightAtTick % 20 === 0; // Every 20 kg
                    const isMediumTick = weightAtTick % 10 === 0 && !isLargeTick; // Every 10 kg
                    const isSmallMedium = weightAtTick % 5 === 0 && !isLargeTick && !isMediumTick; // Every 5 kg
                    const tickHeight = isLargeTick ? 25 : isMediumTick ? 18 : isSmallMedium ? 12 : 8;

                    return (
                        <View
                            key={i}
                            style={[
                                styles.tick,
                                {
                                    left: tickPosition,
                                    height: scaleVertical(tickHeight),
                                    backgroundColor: isLargeTick ? '#666' : isMediumTick ? '#999' : '#D0D0D0',
                                }
                            ]}
                        />
                    );
                })}
            </View>

            <View style={styles.rulerLine} pointerEvents="none" />

            {/* Fixed number marks at bottom */}
            <View style={styles.rulerNumbers} pointerEvents="none">
                {fixedMarks.map((n) => (
                    <Text key={n} style={styles.rulerNumber}>{n}</Text>
                ))}
            </View>

            {/* Active pointer moves based on weight */}
            <View style={[styles.activePointer, { left: pointerPosition }]} pointerEvents="none" />
        </View>
    );
};

const styles = StyleSheet.create({
    rulerContainer: {
        height: scaleVertical(100),
        justifyContent: 'flex-end',
        position: 'relative',
        marginHorizontal: -20, // Extend beyond parent padding
    },
    ticksContainer: {
        position: 'absolute',
        bottom: scaleVertical(35),
        left: 0,
        right: 0,
        height: scaleVertical(30),
    },
    tick: {
        position: 'absolute',
        bottom: 0,
        width: 1,
        borderRadius: 0.5,
    },
    rulerLine: {
        position: 'absolute',
        bottom: scaleVertical(35),
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    rulerNumbers: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        position: 'absolute',
        bottom: scaleVertical(8),
        paddingHorizontal: scale(20),
    },
    rulerNumber: {
        fontSize: FontSizes.body,
        color: '#999',
        fontFamily: 'Cairo_400Regular',
    },
    activePointer: {
        position: 'absolute',
        bottom: scaleVertical(30),
        width: scale(3),
        height: scaleVertical(40),
        backgroundColor: '#7C3AED',
        borderRadius: 2,
        marginLeft: -scale(1.5),
    }
});
