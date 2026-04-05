import { useAuth } from '@/config/authContext';
import authService from '@/config/authService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';

export interface FieldErrors {
    name?: string;
    identifier?: string;
    mobile?: string;
    password?: string;
    confirmPassword?: string;
}

export const useAuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [countryCode, setCountryCode] = useState('+966');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
        if (fieldErrors.mobile) setFieldErrors(prev => ({ ...prev, mobile: undefined }));
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
        if (fieldErrors.identifier) setFieldErrors(prev => ({ ...prev, identifier: undefined }));
    };

    const setNameWithClear = (text: string) => {
        setName(text);
        if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
    };

    const setPasswordWithClear = (text: string) => {
        setPassword(text);
        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
    };

    const setConfirmPasswordWithClear = (text: string) => {
        setConfirmPassword(text);
        if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
    };

    const router = useRouter();
    const { login, getOnboardingStep } = useAuth();

    const toggleAuthMode = () => {
        setIsLogin(prev => !prev);
        setFieldErrors({});
    };
    const setAuthMode = (mode: boolean) => {
        setIsLogin(mode);
        setFieldErrors({});
    };

    const handleNext = async () => {
        setFieldErrors({});
        setLoading(true);
        try {
            if (isLogin) {
                // Validate login fields
                const errors: FieldErrors = {};
                if (!identifier.trim()) errors.identifier = 'يرجى إدخال البريد الإلكتروني أو رقم الجوال';
                if (!password.trim()) errors.password = 'يرجى إدخال كلمة المرور';

                if (Object.keys(errors).length > 0) {
                    setFieldErrors(errors);
                    setLoading(false);
                    return;
                }

                const profile = await login({ login: identifier.trim(), password });
                const nextStep = getOnboardingStep(profile);
                if (nextStep) {
                    router.replace(nextStep as any);
                } else {
                    router.replace('/pages/tabs/homescreen' as any);
                }

            } else {
                // Validate register fields
                const errors: FieldErrors = {};
                if (!name.trim()) errors.name = 'يرجى إدخال الاسم';
                if (!identifier.trim()) {
                    errors.identifier = 'يرجى إدخال البريد الإلكتروني';
                } else {
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(identifier.trim())) {
                        errors.identifier = 'البريد الإلكتروني غير صالح (مثال: user@example.com)';
                    }
                }
                if (!mobile.trim()) {
                    errors.mobile = 'يرجى إدخال رقم الجوال';
                } else if (mobile.trim().length < 9) {
                    errors.mobile = 'رقم الجوال يجب أن يكون ٩ أرقام على الأقل';
                }
                if (!password.trim()) {
                    errors.password = 'يرجى إدخال كلمة المرور';
                }
                if (!confirmPassword.trim()) {
                    errors.confirmPassword = 'يرجى تأكيد كلمة المرور';
                } else if (password !== confirmPassword) {
                    errors.confirmPassword = 'كلمة المرور غير متطابقة';
                }

                if (Object.keys(errors).length > 0) {
                    setFieldErrors(errors);
                    setLoading(false);
                    return;
                }

                const fullPhoneNumber = `${countryCode}${mobile.trim()}`.replace('+', '');

                await authService.sendOtp({
                    login: identifier.trim(),
                    register: {
                        name: name.trim(),
                        email: identifier.trim(),
                        phone: fullPhoneNumber,
                        password,
                        password_confirmation: confirmPassword,
                    },
                });

                router.push({
                    pathname: '/pages/verification',
                    params: { login: identifier.trim() },
                } as any);
            }
        } catch (error: any) {
            // Parse backend field-level errors
            if (error?.response?.data?.errors) {
                const backendErrors = error.response.data.errors;
                const mapped: FieldErrors = {};
                if (backendErrors.email) mapped.identifier = Array.isArray(backendErrors.email) ? backendErrors.email[0] : backendErrors.email;
                if (backendErrors.login) mapped.identifier = Array.isArray(backendErrors.login) ? backendErrors.login[0] : backendErrors.login;
                if (backendErrors.name) mapped.name = Array.isArray(backendErrors.name) ? backendErrors.name[0] : backendErrors.name;
                if (backendErrors.phone) mapped.mobile = Array.isArray(backendErrors.phone) ? backendErrors.phone[0] : backendErrors.phone;
                if (backendErrors.password) mapped.password = Array.isArray(backendErrors.password) ? backendErrors.password[0] : backendErrors.password;
                if (backendErrors.password_confirmation) mapped.confirmPassword = Array.isArray(backendErrors.password_confirmation) ? backendErrors.password_confirmation[0] : backendErrors.password_confirmation;
                if (Object.keys(mapped).length > 0) {
                    setFieldErrors(mapped);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        isLogin,
        identifier,
        setIdentifier: setIdentifierWithConversion,
        password,
        setPassword: setPasswordWithClear,
        name,
        setName: setNameWithClear,
        mobile,
        setMobile: setMobileWithConversion,
        countryCode,
        setCountryCode,
        confirmPassword,
        setConfirmPassword: setConfirmPasswordWithClear,
        loading,
        fieldErrors,
        toggleAuthMode,
        setAuthMode,
        handleNext,
    };
};
