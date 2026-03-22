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
    const sliderWidth = screenWidth;

    const minWeight = 40;
    const maxWeight = 120;
    const totalRange = maxWeight - minWeight;

    const fixedMarks = [40, 60, 80, 100, 120];

    const tickCount = totalRange;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i);

    const pointerPosition = ((weight - minWeight) / totalRange) * sliderWidth;

    return (
        <View style={[styles.rulerContainer, { width: sliderWidth }]} {...panHandlers}>
            <View style={styles.ticksContainer} pointerEvents="none">
                {ticks.map((i) => {
                    const tickPosition = (i / tickCount) * sliderWidth;
                    const weightAtTick = minWeight + i;
                    const isLargeTick = weightAtTick % 20 === 0;
                    const isMediumTick = weightAtTick % 10 === 0 && !isLargeTick;
                    const isSmallMedium = weightAtTick % 5 === 0 && !isLargeTick && !isMediumTick;
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

            <View style={styles.rulerNumbers} pointerEvents="none">
                {fixedMarks.map((n) => (
                    <Text key={n} style={styles.rulerNumber}>{n}</Text>
                ))}
            </View>

            <View style={[styles.activePointer, { left: pointerPosition }]} pointerEvents="none" />
        </View>
    );
};

const styles = StyleSheet.create({
    rulerContainer: {
        height: scaleVertical(100),
        justifyContent: 'flex-end',
        position: 'relative',
        marginHorizontal: -20,
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
