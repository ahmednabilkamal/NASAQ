    import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService, { LoginData, RegisterData, UpdateProfileData, GoogleLoginData } from './authService';
import { initializeToken, clearAuthData } from './authToken';
import { ROUTES } from '@/constants/routes';
import {
    isStylistUser,
    isStylistVerified,
    hasClientMeasurementsComplete,
} from '@/config/navigationFlow';

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
    body_measurements?: Record<string, number | string>;
    fashion_styles?: number[];
    role?: string;
    stylist_verified?: boolean;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (data: LoginData) => Promise<User | null>;
    register: (data: RegisterData) => Promise<void>;
    googleLogin: (data: GoogleLoginData) => Promise<User | null>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<User | null>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    deleteAccount: () => Promise<void>;
    getOnboardingStep: (user: User | null) => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async (): Promise<User | null> => {
        try {
            const data = await AuthService.getProfile();
            const profile: User = data?.data ?? data?.user ?? data;
            setUser(profile);
            return profile;
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401 || status === 403) {
                await clearAuthData();
            }
            setUser(null);
            if (status !== 401 && status !== 403) {
                console.error('❌ Failed to refresh user profile:', error);
            }
            return null;
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

    const login = async (data: LoginData): Promise<User | null> => {
        const result = await AuthService.login(data);
        const profile: User = result?.data?.user ?? result?.user ?? result?.data ?? result;
        if (profile?.id) {
            setUser(profile);
            return profile;
        }
        return refreshUser();
    };

    const register = async (data: RegisterData): Promise<void> => {
        await AuthService.register(data);
    };

    const googleLogin = async (data: GoogleLoginData): Promise<User | null> => {
        const result = await AuthService.googleLogin(data);
        const profile: User = result?.data?.user ?? result?.user ?? result?.data ?? result;
        if (profile?.id) {
            setUser(profile);
            return profile;
        }
        return refreshUser();
    };

    const updateProfile = async (data: UpdateProfileData): Promise<void> => {
        await AuthService.updateProfile(data);
        await refreshUser();
    };

    const logout = async (): Promise<void> => {
        setUser(null);
        try {
            await AuthService.logout();
        } catch {
            await clearAuthData();
        }
    };

    const deleteAccount = async (): Promise<void> => {
        await AuthService.deleteAccount();
        setUser(null);
    };

    const getOnboardingStep = (u: User | null): string | null => {
        if (!u) return null;
        if (isStylistUser(u) && !isStylistVerified(u)) {
            if (!u.gender) {
                return ROUTES.onboarding.stylistGenderSelection;
            }
            return ROUTES.stylist.pendingVerification;
        }
        if (isStylistUser(u) && isStylistVerified(u)) {
            return ROUTES.stylist.home;
        }
        // New users should pick their journey first (stylist vs client).
        if (!u.gender) return ROUTES.onboarding.roleSelection;
        if (!u.height) return ROUTES.onboarding.heightSelection;
        if (!u.weight) return ROUTES.onboarding.weightSelection;
        if (!u.skin_tones) return ROUTES.onboarding.colorSelection;
        if (!u.body_shape) return ROUTES.onboarding.bodyShape;
        if (!hasClientMeasurementsComplete(u)) {
            return ROUTES.onboarding.boyMeasurements;
        }
        if (!u.fashion_styles || u.fashion_styles.length === 0) return ROUTES.onboarding.styleIdentity;
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
                deleteAccount,
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
