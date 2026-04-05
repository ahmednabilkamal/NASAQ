import type { AxiosRequestConfig } from "axios";
import api from "./axios";
import { setAccessToken } from "./authToken";

export interface LoginData {
    login: string;
    password: string;
    device_name?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    city_id?: number;
}

export interface PendingRegisterPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    city_id?: number;
}

export interface OtpSendData {
    login: string;
    register?: PendingRegisterPayload;
}

export interface OtpVerifyData {
    login: string;
    otp: string;
    device_name?: string;
}

export interface GoogleLoginData {
    id_token: string;
    device_name?: string;
}

export interface UpdateProfileData {
    name?: string;
    email?: string;
    phone?: string;
    gender?: string;
    password?: string;
    password_confirmation?: string;
    height?: number;
    weight?: number;
    skin_tones?: string;
    body_shape?: string;
    body_measurements?: Record<string, number | boolean | string>;
    fashion_styles?: number[];
    city_id?: number;
    image?: any;
}

export const authService = {
    register: async (data: RegisterData) => {
        const response = await api.post("/user/register", data);
        return response.data;
    },

    login: async (data: LoginData) => {
        const payload = { device_name: 'venus-app', ...data };
        const response = await api.post("/user/login", payload);
        const token: string | undefined =
            response.data?.data?.token ??
            response.data?.token ??
            response.data?.access_token ??
            response.data?.accessToken;
        if (token) {
            await setAccessToken(token);
            console.log('✅ Login successful, token stored');
        }
        return response.data;
    },

    sendOtp: async (data: OtpSendData, axiosConfig?: AxiosRequestConfig) => {
        const response = await api.post("/user/send-otp", data, axiosConfig);
        return response.data;
    },

    verifyOtp: async (data: OtpVerifyData, axiosConfig?: AxiosRequestConfig) => {
        const payload = { device_name: 'venus-app', ...data };
        const response = await api.post("/user/verify-otp", payload, axiosConfig);
        const token: string | undefined =
            response.data?.data?.token ??
            response.data?.token ??
            response.data?.access_token ??
            response.data?.accessToken;
        if (token) {
            await setAccessToken(token);
            console.log('✅ OTP verified, token stored');
        }
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get("/user/profile");
        return response.data;
    },

    updateProfile: async (data: UpdateProfileData) => {
        let payload: any = data;

        const isLocalPickerImageUri = (uri: string) =>
            uri.startsWith('file://') ||
            uri.startsWith('content://') ||
            uri.startsWith('ph://') ||
            uri.startsWith('assets-library://');

        if (data.image && typeof data.image === 'string' && isLocalPickerImageUri(data.image)) {
            payload = new FormData();

            const appendRecursive = (obj: any, prefix = '') => {
                Object.keys(obj).forEach((key) => {
                    const value = obj[key];
                    const fullKey = prefix ? `${prefix}[${key}]` : key;

                    if (key === 'image' && prefix === '' && typeof value === 'string' && isLocalPickerImageUri(value)) {
                        const filename = value.split('/').pop()?.split('?')[0] || 'upload.jpg';
                        const match = /\.(\w+)$/.exec(filename);
                        const ext = (match?.[1] || 'jpg').toLowerCase();
                        const mime =
                            ext === 'png'
                                ? 'image/png'
                                : ext === 'webp'
                                  ? 'image/webp'
                                  : ext === 'heic' || ext === 'heif'
                                    ? 'image/heic'
                                    : 'image/jpeg';
                        payload.append('image', { uri: value, name: filename, type: mime } as any);
                    } else if (Array.isArray(value)) {
                        value.forEach((v, i) => {
                            payload.append(`${fullKey}[${i}]`, v);
                        });
                    } else if (value !== null && typeof value === 'object') {
                        appendRecursive(value, fullKey);
                    } else if (value !== undefined && value !== null) {
                        payload.append(fullKey, value);
                    }
                });
            };

            appendRecursive(data);
        }

        const response = await api.post("/user/update", payload);
        return response.data;
    },

    logout: async () => {
        try {
            await api.delete("/user/push-token", { skipErrorToast: true });
        } catch {
            /* ignore */
        }
        await api.post("/user/logout");
        await setAccessToken(null);
        console.log('✅ Logout successful, token cleared');
    },

    /** Soft-delete account and clear token (DELETE /api/user/account). */
    deleteAccount: async () => {
        await api.delete("/user/account");
        await setAccessToken(null);
    },

    registerPushToken: async (body: {
        expo_push_token: string;
        device_id?: string | null;
        platform?: string | null;
    }) => {
        const response = await api.post("/user/push-token", body);
        return response.data;
    },

    removePushToken: async (expo_push_token?: string) => {
        const response = await api.delete("/user/push-token", {
            ...(expo_push_token ? { data: { expo_push_token } } : {}),
            skipErrorToast: true,
        });
        return response.data;
    },

    getCards: async () => {
        const response = await api.get("/user/cards");
        return response.data;
    },

    storeCard: async (data: { card_name?: string, last_four: string, card_type?: string }) => {
        const response = await api.post("/user/cards", data);
        return response.data;
    },

    deleteCard: async (id: number) => {
        const response = await api.delete(`/user/cards/${id}`);
        return response.data;
    },

    changePassword: async (data: { otp: string, password: string, password_confirmation: string }) => {
        const response = await api.post("/user/change-password", data);
        return response.data;
    },

    googleLogin: async (data: GoogleLoginData) => {
        const payload = { device_name: 'venus-app-google', ...data };
        const response = await api.post("/user/google-login", payload);
        const token: string | undefined =
            response.data?.data?.token ??
            response.data?.token ??
            response.data?.access_token ??
            response.data?.accessToken;
        if (token) {
            await setAccessToken(token);
            console.log('✅ Google login successful, token stored');
        }
        return response.data;
    },
};

export default authService;
