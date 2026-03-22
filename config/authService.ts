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

export interface OtpSendData {
    login: string;
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
    body_measurements?: {
        shoulder?: number;
        chest?: number;
        waist?: number;
        arm?: number;
        hip?: number;
        thigh?: number;
        leg?: number;
    };
    fashion_styles?: number[];
    city_id?: number;
    image?: any;
    instagram?: string;
    twitter?: string;
    facebook?: string;
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

    sendOtp: async (data: OtpSendData) => {
        const response = await api.post("/user/send-otp", data);
        return response.data;
    },

    verifyOtp: async (data: OtpVerifyData) => {
        const payload = { device_name: 'venus-app', ...data };
        const response = await api.post("/user/verify-otp", payload);
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

        if (data.image && typeof data.image === 'string' && (data.image.startsWith('file://') || data.image.startsWith('content://'))) {
            payload = new FormData();

            const appendRecursive = (obj: any, prefix = '') => {
                Object.keys(obj).forEach((key) => {
                    const value = obj[key];
                    const fullKey = prefix ? `${prefix}[${key}]` : key;

                    if (key === 'image' && prefix === '' && typeof value === 'string' && (value.startsWith('file://') || value.startsWith('content://'))) {
                        const filename = value.split('/').pop() || 'upload.jpg';
                        const match = /\.(\w+)$/.exec(filename);
                        const type = match ? `image/${match[1]}` : `image/jpeg`;
                        payload.append('image', { uri: value, name: filename, type } as any);
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

        const response = await api.post("/user/update", payload, {
            headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        return response.data;
    },

    logout: async () => {
        await api.post("/user/logout");
        await setAccessToken(null);
        console.log('✅ Logout successful, token cleared');
    },

    registerPushToken: async (expo_push_token: string) => {
        const response = await api.post("/user/push-token", { expo_push_token });
        return response.data;
    },

    removePushToken: async () => {
        const response = await api.delete("/user/push-token");
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
