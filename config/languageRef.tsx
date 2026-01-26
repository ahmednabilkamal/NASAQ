import React, { useEffect, createContext, useContext } from 'react';
import { I18nManager, DevSettings } from 'react-native';
import * as Updates from 'expo-updates';

interface LanguageContextType {
    languageCode: string;
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
    languageCode: string;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, languageCode }) => {
    useEffect(() => {
        const updateLanguage = async () => {

            const isRTL = languageCode === 'ar';
            
            if (I18nManager.isRTL !== isRTL) {
                I18nManager.allowRTL(isRTL);
                I18nManager.forceRTL(isRTL);

                setTimeout(() => {
                    if (__DEV__) {
                        DevSettings.reload();
                    } else {
                        Updates.reloadAsync().catch(() => {
                            DevSettings.reload();
                        });
                    }
                }, 100);
            }
        };

        updateLanguage();
    }, [languageCode]);

    return (
        <LanguageContext.Provider value={{ languageCode }}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageProvider;

