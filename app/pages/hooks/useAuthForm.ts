import { useAuth } from '@/config/authContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export const useAuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { login, register } = useAuth();

    const toggleAuthMode = () => setIsLogin(prev => !prev);
    const setAuthMode = (mode: boolean) => setIsLogin(mode);

    const handleNext = async () => {
        if (isLogin) {
            console.log("Login:", { email: identifier, password });
            router.replace('/pages/tabs/homescreen');
        } else {
            console.log("Register:", { name, email: identifier, phone: mobile, password });
            router.push('/pages/verification' as any);
        }
    };

    return {
        isLogin,
        identifier,
        setIdentifier,
        password,
        setPassword,
        name,
        setName,
        mobile,
        setMobile,
        confirmPassword,
        setConfirmPassword,
        loading,
        toggleAuthMode,
        setAuthMode,
        handleNext,
    };
};