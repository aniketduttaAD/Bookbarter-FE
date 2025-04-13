import { z } from "zod";

export const wishlistItemSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
    author: z.string().max(100, "Author must be less than 100 characters").optional(),
});

export type WishlistItemData = z.infer<typeof wishlistItemSchema>;