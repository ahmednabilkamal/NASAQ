import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

/** App is Arabic-only; UI copy and layout always use RTL Arabic. */
export const APP_LANGUAGE = 'ar' as const;

// Force RTL at module load - this is the key for React Native RTL support
if (!I18nManager.isRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
}

interface LanguageContextType {
    languageCode: typeof APP_LANGUAGE;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

interface LanguageProviderProps {
    children: React.ReactNode;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [ready, setReady] = useState(I18nManager.isRTL);

    useEffect(() => {
        // If RTL wasn't applied yet, force it and reload
        if (!I18nManager.isRTL) {
            I18nManager.allowRTL(true);
            I18nManager.forceRTL(true);
            // Need to reload for RTL to take effect
            Updates.reloadAsync().catch(() => {
                // Fallback - just continue, user might need to restart app
                setReady(true);
            });
        } else {
            setReady(true);
        }
    }, []);

    if (!ready) {
        return null; // Wait for RTL to be ready
    }

    return (
        <LanguageContext.Provider value={{ languageCode: APP_LANGUAGE }}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageProvider;
