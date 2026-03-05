import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeightSliderProps {
    height: number;
    panHandlers: any;
}

export const HeightSlider: React.FC<HeightSliderProps> = ({ height, panHandlers }) => {
    return (
        <View style={styles.scaleContainer} {...panHandlers}>
            <View style={styles.scaleRuler} pointerEvents="none">
                {[190, 180, 170, 160, 150, 140].map((val) => (
                    <View key={val} style={styles.scaleMark}>
                        <Text style={styles.scaleLabel}>{val}</Text>
                        <View style={styles.scaleLine} />
                    </View>
                ))}
            </View>

            <View style={[styles.activeLine, { top: ((190 - height) / (190 - 140)) * 240 }]} pointerEvents="none" />
            <View style={[styles.activeCircle, { top: ((190 - height) / (190 - 140)) * 240 - 4 }]} pointerEvents="none" />
        </View>
    );
};

const styles = StyleSheet.create({
    scaleContainer: {
        width: 80,
        height: 240,
        marginTop: 50,
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
        fontSize: 14,
        color: '#999',
        marginRight: 10,
    },
    scaleLine: {
        width: 20,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    activeLine: {
        position: 'absolute',
        left: -180,
        right: 0,
        height: 2,
        backgroundColor: '#DDA0DD',
    },
    activeCircle: {
        position: 'absolute',
        right: -4,
        width: 12,
        height: 12,
        borderRadius: 6,
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
