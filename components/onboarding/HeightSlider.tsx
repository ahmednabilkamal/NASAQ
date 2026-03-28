import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { HEIGHT_SLIDER_TRACK_HEIGHT } from '@/constants/onboardingSliders';

export { HEIGHT_SLIDER_TRACK_HEIGHT };

interface HeightSliderProps {
    height: number;
    panHandlers: object;
    minCm?: number;
    maxCm?: number;
}

export const HeightSlider: React.FC<HeightSliderProps> = ({
    height,
    panHandlers,
    minCm = 140,
    maxCm = 190,
}) => {
    const { width: windowWidth } = useWindowDimensions();
    const lineSpan = Math.min(200, Math.max(120, windowWidth * 0.42));

    const marks = [190, 180, 170, 160, 150, 140];
    const range = maxCm - minCm;
    const yFromTop = range > 0 ? ((maxCm - height) / range) * HEIGHT_SLIDER_TRACK_HEIGHT : HEIGHT_SLIDER_TRACK_HEIGHT / 2;

    return (
        <View style={styles.ltrWrap}>
            <View style={styles.scaleContainer} {...panHandlers}>
                <View style={styles.scaleRuler} pointerEvents="none">
                    {marks.map((val) => (
                        <View key={val} style={styles.scaleMark}>
                            <Text style={styles.scaleLabel}>{val}</Text>
                            <View style={styles.scaleLine} />
                        </View>
                    ))}
                </View>

                <View
                    style={[
                        styles.activeLine,
                        {
                            top: yFromTop,
                            width: lineSpan,
                            left: -lineSpan + 28,
                        },
                    ]}
                    pointerEvents="none"
                />
                <View
                    style={[
                        styles.activeCircle,
                        {
                            top: yFromTop - 5,
                        },
                    ]}
                    pointerEvents="none"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    ltrWrap: {
        direction: 'ltr',
    },
    scaleContainer: {
        width: 80,
        height: HEIGHT_SLIDER_TRACK_HEIGHT,
        marginTop: 0,
        position: 'relative',
        justifyContent: 'center',
    },
    scaleRuler: {
        height: '100%',
        justifyContent: 'space-between',
    },
    scaleMark: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    scaleLabel: {
        fontSize: 13,
        color: '#999',
        fontFamily: 'Cairo_400Regular',
        marginRight: 10,
        minWidth: 28,
        textAlign: 'right',
    },
    scaleLine: {
        width: 22,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    activeLine: {
        position: 'absolute',
        height: 2,
        backgroundColor: '#064E3B',
        borderRadius: 1,
    },
    activeCircle: {
        position: 'absolute',
        right: -5,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#064E3B',
        borderWidth: 2,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
});
