import { useState, useMemo } from 'react';
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

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            const relativeX = Math.max(0, Math.min(sliderWidth, evt.nativeEvent.locationX));
            const newWeight = Math.round((minWeight + (relativeX / sliderWidth) * (maxWeight - minWeight)) * 10) / 10;
            setWeight(newWeight);
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
