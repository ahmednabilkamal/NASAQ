import { useState, useMemo, useRef } from 'react';
import { PanResponder } from 'react-native';
import { HEIGHT_SLIDER_TRACK_HEIGHT } from '@/constants/onboardingSliders';

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
    sliderHeight = HEIGHT_SLIDER_TRACK_HEIGHT,
}: UseHeightSelectionProps = {}) => {
    const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
    const [height, setHeight] = useState(initialHeight);
    const startHeightRef = useRef(initialHeight);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt, gestureState) => {
            const relativeY = Math.max(0, Math.min(sliderHeight, evt.nativeEvent.locationY));
            const newHeight = Math.round(maxHeight - (relativeY / sliderHeight) * (maxHeight - minHeight));
            setHeight(newHeight);
            startHeightRef.current = newHeight;
        },
        onPanResponderMove: (evt, gestureState) => {
            const heightChange = (gestureState.dy / sliderHeight) * (maxHeight - minHeight);
            const newHeight = Math.round(startHeightRef.current - heightChange);
            const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
            setHeight(clampedHeight);
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
