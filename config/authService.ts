import api from "./axios";
import { setAccessToken } from "./authToken";

export interface LoginData {
    email: string;
    password?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password?: string;
    password_confirmation?: string;
}

export const authService = {
    login: async (data: LoginData) => {
        const response = await api.post("/user/login", data);
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
        }
        return response.data;
    },

    register: async (data: RegisterData) => {
        const response = await api.post("/user/register", data);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get("/user/profile");
        return response.data;
    },

    logout: async () => {
        await api.post("/user/logout");
        setAccessToken(null);
    }
};
