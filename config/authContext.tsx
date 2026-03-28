import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { LoginData, RegisterData, UpdateProfileData, GoogleLoginData } from './authService';
import { initializeToken, clearAuthData } from './authToken';

export interface User {
    id: number | string;
    name: string;
    email: string;
    phone?: string;
    gender?: string;
    height?: number;
    weight?: number;
    skin_tones?: string;
    body_shape?: string;
    body_measurements?: Record<string, number>;
    fashion_styles?: number[];
    role?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    googleLogin: (data: GoogleLoginData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    getOnboardingStep: (user: User | null) => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async (): Promise<void> => {
        try {
            const data = await authService.getProfile();
            const profile: User = data?.data ?? data?.user ?? data;
            setUser(profile);
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                await clearAuthData();
            }
            setUser(null);
            if (status !== 401 && status !== 403) {
                console.error('❌ Failed to refresh user profile:', error);
            }
        }
    };

    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            try {
                const token = await initializeToken();
                if (token) {
                    await refreshUser();
                }
            } catch (error) {
                console.error('❌ Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };
        initialize();
    }, []);

    const login = async (data: LoginData): Promise<void> => {
        const result = await authService.login(data);
        const profile: User = result?.data?.user ?? result?.user ?? result?.data ?? result;
        if (profile?.id) {
            setUser(profile);
        } else {
            await refreshUser();
        }
    };

    const register = async (data: RegisterData): Promise<void> => {
        await authService.register(data);
    };

    const googleLogin = async (data: GoogleLoginData): Promise<void> => {
        const result = await authService.googleLogin(data);
        const profile: User = result?.data?.user ?? result?.user ?? result?.data ?? result;
        if (profile?.id) {
            setUser(profile);
        } else {
            await refreshUser();
        }
    };

    const updateProfile = async (data: UpdateProfileData): Promise<void> => {
        await authService.updateProfile(data);
        await refreshUser();
    };

    const logout = async (): Promise<void> => {
        setUser(null);
        try {
            await authService.logout();
        } catch {
            await clearAuthData();
        }
    };

    const getOnboardingStep = (u: User | null): string | null => {
        if (!u) return null;
        if (!u.gender) return '/pages/onboarding/genderSelection';
        if (!u.height) return '/pages/onboarding/heightSelection';
        if (!u.weight) return '/pages/onboarding/weightSelection';
        if (!u.skin_tones) return '/pages/onboarding/colorSelection';
        if (!u.body_shape) return '/pages/onboarding/bodyShape';
        if (!u.body_measurements || Object.keys(u.body_measurements).length === 0) return '/pages/onboarding/bodyMeasurement';
        if (!u.fashion_styles || u.fashion_styles.length === 0) return '/pages/onboarding/styleIdentity';
        return null;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                register,
                googleLogin,
                logout,
                refreshUser,
                updateProfile,
                getOnboardingStep,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
