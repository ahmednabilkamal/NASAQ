import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/config/authContext';
import { Alert } from 'react-native';

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
        setLoading(true);
        try {
            if (isLogin) {
                console.log("Login Payload:", { email: identifier, password });
                await login({ email: identifier, password });
                router.replace('/pages/tabs/homescreen');
            } else {
                console.log("Register Payload:", { name, email: identifier, phone: mobile, password, password_confirmation: confirmPassword });
                if (password !== confirmPassword) {
                    Alert.alert("Error", "Passwords do not match");
                    return;
                }
                await register({ name, email: identifier, phone: mobile, password, password_confirmation: confirmPassword });
                router.push('/pages/verification' as any);
            }
        } catch (error: any) {
            console.error("Auth Error Detail:", error.response?.data || error.message);
            const errorData = error.response?.data;
            let errorMessage = errorData?.message || "Something went wrong";

            
            if (errorData?.errors) {
                const detailedErrors = Object.entries(errorData.errors)
                    .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                    .join('\n');
                errorMessage = `${errorMessage}\n\n${detailedErrors}`;
            }

            Alert.alert("Authentication Failed", errorMessage);
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
