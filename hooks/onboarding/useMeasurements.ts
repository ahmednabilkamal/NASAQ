import { useState } from 'react';

export const useMeasurements = () => {
    const [measurements, setMeasurements] = useState({
        shoulder: '0',
        chest: '0',
        waist: '0',
        arm: '0',
        hip: '0',
        thigh: '0',
        leg: '0',
    });

    const updateMeasurement = (field: string, value: string) => {
        setMeasurements((prev) => ({ ...prev, [field]: value }));
    };

    return {
        measurements,
        updateMeasurement,
    };
};
