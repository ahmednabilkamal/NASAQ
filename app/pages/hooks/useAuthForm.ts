import { useState } from 'react';
import { useRouter } from 'expo-router';

export const useAuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();

    const toggleAuthMode = () => setIsLogin(prev => !prev);
    const setAuthMode = (mode: boolean) => setIsLogin(mode);

    const handleNext = () => {
        router.push('/pages/verification' as any);
    };

    return {
        isLogin,
        toggleAuthMode,
        setAuthMode,
        handleNext,
    };
};
