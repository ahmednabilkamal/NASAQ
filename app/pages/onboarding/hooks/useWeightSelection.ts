import { useState, useMemo, useRef } from 'react';
import { PanResponder } from 'react-native';

interface UseWeightSelectionProps {
    minWeight?: number;
    maxWeight?: number;
    initialWeight?: number;
    sliderWidth?: number;
}

export const useWeightSelection = ({
    minWeight = 40,
    maxWeight = 120,
    initialWeight = 65.7,
    sliderWidth = 300,
}: UseWeightSelectionProps = {}) => {
    const [unit, setUnit] = useState<'lbs' | 'kg'>('kg');
    const [weight, setWeight] = useState(initialWeight);
    const startWeightRef = useRef(initialWeight);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt, gestureState) => {
            const relativeX = Math.max(0, Math.min(sliderWidth, evt.nativeEvent.locationX));
            const newWeight = Math.round((minWeight + (relativeX / sliderWidth) * (maxWeight - minWeight)) * 10) / 10;
            setWeight(newWeight);
            startWeightRef.current = newWeight;
        },
        onPanResponderMove: (evt, gestureState) => {
            const weightChange = (gestureState.dx / sliderWidth) * (maxWeight - minWeight);
            const newWeight = Math.round((startWeightRef.current + weightChange) * 10) / 10;
            const clampedWeight = Math.round(Math.max(minWeight, Math.min(maxWeight, newWeight)) * 10) / 10;
            setWeight(clampedWeight);
        },
    }), [sliderWidth, minWeight, maxWeight]);

    return {
        unit,
        setUnit,
        weight,
        setWeight,
        panHandlers: panResponder.panHandlers,
    };
};
