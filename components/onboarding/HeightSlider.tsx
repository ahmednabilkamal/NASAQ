import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { scale, scaleVertical } from '@/utils/responsive';
import { FontSizes } from '@/utils/typography';

interface HeightSliderProps {
    height: number;
    panHandlers: any;
}

export const HeightSlider: React.FC<HeightSliderProps> = ({ height, panHandlers }) => {
    const { height: screenHeight } = useWindowDimensions();
    const sliderHeight = screenHeight * 0.3; // 30% of screen height

    return (
        <View style={[styles.scaleContainer, { height: sliderHeight }]} {...panHandlers}>
            <View style={styles.scaleRuler} pointerEvents="none">
                {[190, 180, 170, 160, 150, 140].map((val) => (
                    <View key={val} style={styles.scaleMark}>
                        <Text style={styles.scaleLabel}>{val}</Text>
                        <View style={styles.scaleLine} />
                    </View>
                ))}
            </View>

            <View style={[styles.activeLine, { top: ((190 - height) / (190 - 140)) * sliderHeight }]} pointerEvents="none" />
            <View style={[styles.activeCircle, { top: ((190 - height) / (190 - 140)) * sliderHeight - 4 }]} pointerEvents="none" />
        </View>
    );
};

const styles = StyleSheet.create({
    scaleContainer: {
        width: scale(80),
        marginTop: scaleVertical(50),
        position: 'relative',
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
        fontSize: FontSizes.body,
        color: '#999',
        marginRight: scale(10),
    },
    scaleLine: {
        width: scale(20),
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    activeLine: {
        position: 'absolute',
        left: scale(-180),
        right: 0,
        height: 2,
        backgroundColor: '#DDA0DD',
    },
    activeCircle: {
        position: 'absolute',
        right: scale(-4),
        width: scale(12),
        height: scale(12),
        borderRadius: scale(6),
        backgroundColor: '#DDA0DD',
        borderWidth: 2,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    }
});
