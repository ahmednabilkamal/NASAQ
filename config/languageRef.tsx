import React, { useEffect, createContext, useContext } from 'react';
import { I18nManager, DevSettings, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageContextType {
    languageCode: string;
    setLanguage: (code: string) => Promise<void>;
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
    // Initialize with current RTL state to avoid flip-flop on boot
    const [languageCode, setLanguageCode] = React.useState<string>(I18nManager.isRTL ? 'ar' : 'en');
    const [isLoaded, setIsLoaded] = React.useState(false);

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const saved = await AsyncStorage.getItem('user-language');
                if (saved) {
                    setLanguageCode(saved);
                } else {
                    const systemLang = Localization.getLocales()[0].languageTag.split('-')[0];
                    const targetLang = systemLang === 'ar' ? 'ar' : 'en';
                    setLanguageCode(targetLang);
                }
            } catch (e) {
                console.error('Failed to load language:', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadLanguage();
    }, []);

    useEffect(() => {
        if (!isLoaded) return; // Wait until we know the choice

        const updateLanguage = async () => {
            const isRTL = languageCode === 'ar';
            
            if (I18nManager.isRTL !== isRTL) {
                I18nManager.allowRTL(isRTL);
                I18nManager.forceRTL(isRTL);

                setTimeout(() => {
                    if (Platform.OS === 'web') {
                        window.location.reload();
                        return;
                    }

                    if (__DEV__) {
                        if (DevSettings && typeof DevSettings.reload === 'function') {
                            DevSettings.reload();
                        } else {
                            Updates.reloadAsync().catch(() => {});
                        }
                    } else {
                        Updates.reloadAsync().catch(() => {
                            if (DevSettings && typeof DevSettings.reload === 'function') {
                                DevSettings.reload();
                            }
                        });
                    }
                }, 100);
            }
        };

        updateLanguage();
    }, [languageCode]);

    const setLanguage = async (code: string) => {
        await AsyncStorage.setItem('user-language', code);
        setLanguageCode(code);
    };

    return (
        <LanguageContext.Provider value={{ languageCode, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageProvider;

