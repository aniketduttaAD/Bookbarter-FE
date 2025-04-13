import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";
import Cookies from 'js-cookie';

const cookieStorage = {
    getItem: (name: string) => {
        const value = Cookies.get(name);
        return value ? value : null;
    },
    setItem: (name: string, value: string) => {
        Cookies.set(name, value, {
            path: '/',
            expires: 7,
            sameSite: 'lax'
        });
    },
    removeItem: (name: string) => {
        Cookies.remove(name, { path: '/' });
    },
};

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isOwner: boolean;
    isSeeker: boolean;
    isLoading: boolean;
    error: string | null;

    login: (user: User, token: string) => void;
    logout: () => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isOwner: false,
            isSeeker: false,
            isLoading: false,
            error: null,

            login: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isOwner: user.role === "owner",
                    isSeeker: user.role === "seeker",
                    error: null,
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isOwner: false,
                    isSeeker: false,
                    error: null,
                }),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),

            updateUser: (userData) =>
                set((state) => {
                    const updatedUser = state.user
                        ? { ...state.user, ...userData }
                        : null;
                    return {
                        user: updatedUser,
                        isOwner: updatedUser?.role === "owner",
                        isSeeker: updatedUser?.role === "seeker",
                    };
                }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => cookieStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                isOwner: state.isOwner,
                isSeeker: state.isSeeker,
            }),
        }
    )
);