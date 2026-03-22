import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import authService from '@/config/authService';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export const useGoogleAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    });

    const signInWithGoogle = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await promptAsync();
            if (result.type === 'success') {
                const { id_token } = result.params;
                if (id_token) {
                    const response = await authService.googleLogin({ id_token });
                    setLoading(false);
                    return response;
                }
            } else if (result.type === 'cancel') {
                setError('Google sign-in was cancelled');
            }
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
            console.error('Google sign-in error:', err);
        }
        setLoading(false);
        return null;
    };

    return {
        signInWithGoogle,
        loading,
        error,
        isReady: !!request,
    };
};
