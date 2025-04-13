import { z } from "zod";

export const ratingSchema = z.object({
    bookId: z.string().min(1, "Book ID is required"),
    ownerId: z.string().min(1, "Owner ID is required"),
    rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    review: z.string().optional(),
});

export type RatingData = z.infer<typeof ratingSchema>;