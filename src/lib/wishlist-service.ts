import { offlineApi } from "./offline-api";
import { WishlistItem } from "@/types";
import { useAuthStore } from "@/store/auth-store";

export const wishlistService = {
    getWishlist: async (): Promise<WishlistItem[]> => {
        const response = await offlineApi.get<WishlistItem[]>("/wishlist");
        return response;
    },

    addWishlistItem: async (data: {
        title: string;
        author?: string;
    }): Promise<WishlistItem> => {
        const response = await offlineApi.post<WishlistItem>("/wishlist", data);
        return response;
    },

    removeWishlistItem: async (id: string): Promise<void> => {
        await offlineApi.delete(`/wishlist/${id}`);
    },

    addBookToWishlist: async (bookId: string): Promise<WishlistItem> => {
        const response = await offlineApi.post<WishlistItem>(`/wishlist/books/${bookId}`, {});
        return response;
    },

    isBookInWishlist: async (bookId: string): Promise<boolean> => {
        try {
            const user = useAuthStore.getState().user;
            if (!user || user.role !== "seeker") {
                return false;
            }

            const response = await offlineApi.get<{ inWishlist: boolean }>(`/wishlist/check/${bookId}`);
            return response.inWishlist;
        } catch (error) {
            console.error("Error checking wishlist:", error);
            return false;
        }
    },
};