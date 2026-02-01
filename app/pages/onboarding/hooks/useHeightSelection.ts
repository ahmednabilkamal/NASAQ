import { useState, useMemo } from 'react';
import { PanResponder } from 'react-native';

interface UseHeightSelectionProps {
    minHeight?: number;
    maxHeight?: number;
    initialHeight?: number;
    sliderHeight?: number;
}

export const useHeightSelection = ({
    minHeight = 140,
    maxHeight = 190,
    initialHeight = 170,
    sliderHeight = 240,
}: UseHeightSelectionProps = {}) => {
    const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
    const [height, setHeight] = useState(initialHeight);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            const relativeY = Math.max(0, Math.min(sliderHeight, evt.nativeEvent.locationY));
            const newHeight = Math.round(maxHeight - (relativeY / sliderHeight) * (maxHeight - minHeight));
            setHeight(newHeight);
        },
    }), [sliderHeight, minHeight, maxHeight]);

    return {
        unit,
        setUnit,
        height,
        setHeight,
        panHandlers: panResponder.panHandlers,
    };
};
