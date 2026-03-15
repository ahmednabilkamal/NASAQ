import { useAuth } from '@/config/authContext';
import authService from '@/config/authService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';

export const useAuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);

    const [identifier, setIdentifier] = useState('');    // email or phone for login/register
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { login, register, getOnboardingStep } = useAuth();

    const toggleAuthMode = () => setIsLogin(prev => !prev);
    const setAuthMode = (mode: boolean) => setIsLogin(mode);

    const handleNext = async () => {
        setLoading(true);
        try {
            if (isLogin) {
                if (!identifier.trim() || !password.trim()) {
                    Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
                    setLoading(false);
                    return;
                }
                const result = await login({ login: identifier.trim(), password });
                const nextStep = getOnboardingStep(result as any);
                router.replace(nextStep || '/pages/tabs/homescreen' as any);

            } else {
                if (!name.trim() || !identifier.trim() || !mobile.trim() || !password.trim()) {
                    Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى ملء جميع الحقول المطلوبة' });
                    setLoading(false);
                    return;
                }
                if (password !== confirmPassword) {
                    Toast.show({ type: 'error', text1: 'خطأ', text2: 'كلمة المرور غير متطابقة' });
                    setLoading(false);
                    return;
                }

                await register({
                    name: name.trim(),
                    email: identifier.trim(),
                    phone: mobile.trim(),
                    password,
                    password_confirmation: confirmPassword,
                });

                await authService.sendOtp({ login: identifier.trim() });

                router.push({
                    pathname: '/pages/verification',
                    params: { login: identifier.trim() },
                } as any);
            }
        } catch (error: any) {
        } finally {
            setLoading(false);
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