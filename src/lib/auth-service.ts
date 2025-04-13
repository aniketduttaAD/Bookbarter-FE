import api from "./api";
import { SignupFormData, LoginFormData } from "@/schemas/auth-schema";
import { User } from "@/types";

interface AuthResponse {
    user: User;
    token: string;
}

export const authService = {
    signup: async (data: SignupFormData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/signup", data);
        return response.data;
    },

    login: async (data: LoginFormData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/login", data);
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get<User>("/auth/profile");
        return response.data;
    },

    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await api.patch<User>("/auth/profile", data);
        return response.data;
    },
};