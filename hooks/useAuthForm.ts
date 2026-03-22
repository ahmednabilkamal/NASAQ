import { useAuth } from '@/config/authContext';
import authService from '@/config/authService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';

export const useAuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [countryCode, setCountryCode] = useState('+966');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const convertArabicToWesternNumerals = (text: string): string => {
        const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

        let result = text;
        arabicNumerals.forEach((num, index) => {
            result = result.replace(new RegExp(num, 'g'), index.toString());
        });
        persianNumerals.forEach((num, index) => {
            result = result.replace(new RegExp(num, 'g'), index.toString());
        });
        return result.replace(/[^0-9]/g, '');
    };

    const setMobileWithConversion = (text: string) => {
        const converted = convertArabicToWesternNumerals(text);
        setMobile(converted);
    };

    const setIdentifierWithConversion = (text: string) => {
        const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

        let result = text;
        arabicNumerals.forEach((num, index) => {
            result = result.replace(new RegExp(num, 'g'), index.toString());
        });
        persianNumerals.forEach((num, index) => {
            result = result.replace(new RegExp(num, 'g'), index.toString());
        });
        setIdentifier(result);
    };

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

                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(identifier.trim())) {
                    Toast.show({
                        type: 'error',
                        text1: 'خطأ',
                        text2: 'البريد الإلكتروني غير صالح. يرجى استخدام حروف إنجليزية (مثال: user@example.com)'
                    });
                    setLoading(false);
                    return;
                }

                if (mobile.trim().length < 9) {
                    Toast.show({
                        type: 'error',
                        text1: 'خطأ',
                        text2: 'رقم الجوال يجب أن يكون ٩ أرقام على الأقل'
                    });
                    setLoading(false);
                    return;
                }

                if (password !== confirmPassword) {
                    Toast.show({ type: 'error', text1: 'خطأ', text2: 'كلمة المرور غير متطابقة' });
                    setLoading(false);
                    return;
                }

                const fullPhoneNumber = `${countryCode}${mobile.trim()}`.replace('+', '');

                await register({
                    name: name.trim(),
                    email: identifier.trim(),
                    phone: fullPhoneNumber,
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
        setIdentifier: setIdentifierWithConversion,
        password,
        setPassword,
        name,
        setName,
        mobile,
        setMobile: setMobileWithConversion,
        countryCode,
        setCountryCode,
        confirmPassword,
        setConfirmPassword,
        loading,
        toggleAuthMode,
        setAuthMode,
        handleNext,
    };
};