import { useState, useMemo, useRef } from 'react';
import { PanResponder, useWindowDimensions } from 'react-native';

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
            const relativeX = Math.max(0, Math.min(sliderWidth, evt.nativeEvent.locationX));
            const newWeightKg = Math.round((minWeight + (relativeX / sliderWidth) * (maxWeight - minWeight)) * 10) / 10;
            setWeightKg(newWeightKg);
            startWeightKgRef.current = newWeightKg;
        },
        onPanResponderMove: (_evt, gestureState) => {
            const weightChangeKg = (gestureState.dx / sliderWidth) * (maxWeight - minWeight);
            const newWeightKg = Math.round((startWeightKgRef.current + weightChangeKg) * 10) / 10;
            const clampedWeightKg = Math.round(Math.max(minWeight, Math.min(maxWeight, newWeightKg)) * 10) / 10;
            setWeightKg(clampedWeightKg);
        },
    }), [sliderWidth, minWeight, maxWeight]);

    return {
        unit,
        setUnit,
        weight: weightDisplay,
        weightKg,
        panHandlers: panResponder.panHandlers,
        sliderWidth,
    };
};
