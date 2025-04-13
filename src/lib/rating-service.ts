import { offlineApi } from "./offline-api";
import { Rating } from "@/types";

export const ratingService = {
    createRating: async (data: {
        bookId: string;
        ownerId: string;
        rating: number;
        review?: string;
    }): Promise<Rating> => {
        const response = await offlineApi.post<Rating>("/ratings", data);
        return response;
    },

    getBookRatings: async (bookId: string): Promise<Rating[]> => {
        const response = await offlineApi.get<Rating[]>(`/ratings/book/${bookId}`);
        return response;
    },

    getOwnerRatings: async (ownerId: string): Promise<Rating[]> => {
        const response = await offlineApi.get<Rating[]>(`/ratings/owner/${ownerId}`);
        return response;
    },

    getUserRatingForBook: async (bookId: string): Promise<Rating | null> => {
        try {
            const response = await offlineApi.get<Rating>(`/ratings/book/${bookId}`);
            return response;
        } catch {
            return null;
        }
    },
};
