import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

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

                setTimeout(async () => {
                    await Updates.reloadAsync();
                }, 100);
            }
        };

        updateLanguage();
    }, [languageCode]);

    return <>{ children } </>;
};

export default LanguageProvider;

