import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { LoginData, RegisterData, UpdateProfileData } from './authService';
import { initializeToken, clearAuthData } from './authToken';

// ── Types ──────────────────────────────────────────────────────────────────

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
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    getOnboardingStep: (user: User | null) => string | null;
}


// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    /** Fetch the authenticated user's profile and store it in state. */
    const refreshUser = async (): Promise<void> => {
        try {
            const data = await authService.getProfile();
            const profile: User = data?.data ?? data?.user ?? data;
            setUser(profile);
        } catch (error) {
            console.error('❌ Failed to refresh user profile:', error);
            setUser(null);
        }
    };

    /** On app start, try to restore the session from stored token. */
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

    /** Login with email/phone + password. */
    const login = async (data: LoginData): Promise<void> => {
        const result = await authService.login(data);
        const profile: User = result?.data?.user ?? result?.user ?? result?.data ?? result;
        if (profile?.id) {
            setUser(profile);
        } else {
            // Token was saved by authService.login, now fetch profile
            await refreshUser();
        }
    };

    /** Register a new account (token is NOT returned; user must verify OTP). */
    const register = async (data: RegisterData): Promise<void> => {
        await authService.register(data);
        // No token yet – user needs OTP verification
    };

    /** Update the authenticated user's profile. */
    const updateProfile = async (data: UpdateProfileData): Promise<void> => {
        await authService.updateProfile(data);
        await refreshUser();
    };

    /** Logout – clears token and user state. */
    const logout = async (): Promise<void> => {
        setUser(null);
        try {
            await authService.logout();
        } catch {
            // Even if the API call fails, clear local state
            await clearAuthData();
        }
    };

    /** Determine the next onboarding step or null if complete. */
    const getOnboardingStep = (u: User | null): string | null => {
        if (!u) return null;
        if (!u.gender) return '/pages/onboarding/genderSelection';
        if (!u.height) return '/pages/onboarding/heightSelection';
        if (!u.weight) return '/pages/onboarding/weightSelection';
        if (!u.skin_tones) return '/pages/onboarding/colorSelection';
        if (!u.body_shape) return '/pages/onboarding/bodyShape';
        if (!u.body_measurements || Object.keys(u.body_measurements).length === 0) return '/pages/onboarding/bodyMeasurement';
        if (!u.fashion_styles || u.fashion_styles.length === 0) return '/pages/onboarding/styleIdentity';
        return null; // Completed
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                register,
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
