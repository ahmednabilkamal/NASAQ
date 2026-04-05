import { useState, useMemo, useRef } from 'react';
import { PanResponder, useWindowDimensions } from 'react-native';

interface UseHeightSelectionProps {
    minHeight?: number;
    maxHeight?: number;
    initialHeight?: number;
    sliderWidth?: number;
}

export const useHeightSelection = ({
    minHeight = 140,
    maxHeight = 190,
    initialHeight = 170,
    sliderWidth: sliderWidthOverride,
}: UseHeightSelectionProps = {}) => {
    const { width: windowWidth } = useWindowDimensions();
    const sliderWidth = sliderWidthOverride ?? Math.min(320, Math.max(220, windowWidth - 56));
    const sliderWidthRef = useRef(sliderWidth);
    sliderWidthRef.current = sliderWidth;

    const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
    const [height, setHeight] = useState(initialHeight);
    const startHeightRef = useRef(initialHeight);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
            const w = sliderWidthRef.current;
            const relativeX = Math.max(0, Math.min(w, evt.nativeEvent.locationX));
            const newHeight = Math.round(minHeight + (relativeX / w) * (maxHeight - minHeight));
            setHeight(newHeight);
            startHeightRef.current = newHeight;
        },
        onPanResponderMove: (_evt, gestureState) => {
            const w = sliderWidthRef.current;
            const heightChange = (gestureState.dx / w) * (maxHeight - minHeight);
            const newHeight = Math.round(startHeightRef.current + heightChange);
            const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
            setHeight(clampedHeight);
        },
    }), [minHeight, maxHeight]);

    return {
        unit,
        setUnit,
        height,
        setHeight,
        panHandlers: panResponder.panHandlers,
        sliderWidth,
    };
};
