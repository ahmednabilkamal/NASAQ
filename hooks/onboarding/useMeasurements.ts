import { useState } from 'react';

export const useMeasurements = () => {
    const [measurements, setMeasurements] = useState({
        shoulder: '18',
        chest: '26',
        waist: '15',
        arm: '8',
        hip: '8',
        thigh: '8',
        leg: '8',
    });

    const updateMeasurement = (field: string, value: string) => {
        setMeasurements((prev) => ({ ...prev, [field]: value }));
    };

    return {
        measurements,
        updateMeasurement,
    };
};
