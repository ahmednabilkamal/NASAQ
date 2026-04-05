import { useState, useMemo, useRef } from 'react';
import { PanResponder, useWindowDimensions } from 'react-native';

/** Keep PanResponder instance stable; read width from a ref so window resizes don’t recreate handlers. */

interface UseWeightSelectionProps {
    minWeight?: number;
    maxWeight?: number;
    initialWeight?: number;
    /** Max track width; defaults from screen width minus padding */
    sliderWidth?: number;
}

export const useWeightSelection = ({
    minWeight = 40,
    maxWeight = 120,
    initialWeight = 65.7,
    sliderWidth: sliderWidthOverride,
}: UseWeightSelectionProps = {}) => {
    const { width: windowWidth } = useWindowDimensions();
    const sliderWidth = sliderWidthOverride ?? Math.min(320, Math.max(220, windowWidth - 56));
    const sliderWidthRef = useRef(sliderWidth);
    sliderWidthRef.current = sliderWidth;

    const [unit, setUnit] = useState<'lbs' | 'kg'>('kg');
    const [weightKg, setWeightKg] = useState(initialWeight);
    const startWeightKgRef = useRef(initialWeight);

    const weightDisplay = useMemo(() => {
        const raw = unit === 'lbs' ? weightKg * 2.20462262 : weightKg;
        return Math.round(raw * 10) / 10;
    }, [unit, weightKg]);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
            const w = sliderWidthRef.current;
            const relativeX = Math.max(0, Math.min(w, evt.nativeEvent.locationX));
            const newWeightKg = Math.round((minWeight + (relativeX / w) * (maxWeight - minWeight)) * 10) / 10;
            setWeightKg(newWeightKg);
            startWeightKgRef.current = newWeightKg;
        },
        onPanResponderMove: (_evt, gestureState) => {
            const w = sliderWidthRef.current;
            const weightChangeKg = (gestureState.dx / w) * (maxWeight - minWeight);
            const newWeightKg = Math.round((startWeightKgRef.current + weightChangeKg) * 10) / 10;
            const clampedWeightKg = Math.round(Math.max(minWeight, Math.min(maxWeight, newWeightKg)) * 10) / 10;
            setWeightKg(clampedWeightKg);
        },
    }), [minWeight, maxWeight]);

    return {
        unit,
        setUnit,
        weight: weightDisplay,
        weightKg,
        panHandlers: panResponder.panHandlers,
        sliderWidth,
    };
};
