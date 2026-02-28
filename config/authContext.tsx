import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    mobile?: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const refreshUser = async () => {
        // No API call - just mock user data
        console.log('ℹ️ Mock user refresh (No API)');
        setLoading(false);
    };

    // Initialize on app start
    useEffect(() => {
        const initialize = async () => {
            console.log('🚀 Initializing authentication (No API)...');
            setLoading(false);
        };
        initialize();
    }, []);

    const login = async (data: LoginData) => {
        // Mock login - just set a dummy user
        console.log('✅ Mock login (No API):', data.email);
        setUser({
            id: '1',
            name: 'Demo User',
            email: data.email,
            mobile: '1234567890'
        });
    };

    const register = async (data: RegisterData) => {
        // Mock register - no actual API call
        console.log('✅ Mock register (No API):', data.email);
    };

    const logout = async () => {
        console.log('👋 Mock logout (No API)');
        setUser(null);
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
