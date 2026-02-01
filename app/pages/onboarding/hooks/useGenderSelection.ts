import { useState, useEffect } from 'react';
import { useGender } from '@/config/genderContext';

export const useGenderSelection = () => {
    const { gender, setGender } = useGender();
    const [selected, setSelected] = useState<'male' | 'female' | null>(gender);

    useEffect(() => {
        if (selected) {
            setGender(selected);
        }
    }, [selected, setGender]);

    return {
        selected,
        setSelected,
    };
};
