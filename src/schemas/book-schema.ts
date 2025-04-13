import { z } from "zod";
import { BookCondition, BookGenre, BookStatus } from "@/types";

// Define genre, condition, and status as enum schemas
export const bookGenreSchema = z.enum([
    "fiction",
    "non-fiction",
    "mystery",
    "sci-fi",
    "fantasy",
    "romance",
    "thriller",
    "biography",
    "history",
    "science",
    "self-help",
    "children",
    "young-adult",
    "poetry",
    "comics",
    "other"
] as [BookGenre, ...BookGenre[]]);

export const bookConditionSchema = z.enum([
    "new",
    "like-new",
    "good",
    "fair",
    "poor"
] as [BookCondition, ...BookCondition[]]);

export const bookStatusSchema = z.enum([
    "available",
    "reserved",
    "exchanged"
] as [BookStatus, ...BookStatus[]]);

// Full book creation schema
export const createBookSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters"),
    author: z
        .string()
        .min(1, "Author is required")
        .max(100, "Author must be less than 100 characters"),
    genre: bookGenreSchema,
    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(1000, "Description must be less than 1000 characters"),
    condition: bookConditionSchema,
    location: z
        .string()
        .min(2, "Location is required")
        .max(100, "Location must be less than 100 characters"),
    contactPreference: z
        .string()
        .min(2, "Contact preference is required")
        .max(100, "Contact preference must be less than 100 characters"),
});

// Schema for updating a book
export const updateBookSchema = createBookSchema.partial().extend({
    status: bookStatusSchema.optional(),
});

// Types derived from schemas
export type CreateBookData = z.infer<typeof createBookSchema>;
export type UpdateBookData = z.infer<typeof updateBookSchema>;

// Helper for displaying human-readable labels
export const bookConditionLabels: Record<BookCondition, string> = {
    new: "New",
    "like-new": "Like New",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
};

export const bookGenreLabels: Record<BookGenre, string> = {
    fiction: "Fiction",
    "non-fiction": "Non-Fiction",
    mystery: "Mystery",
    "sci-fi": "Science Fiction",
    fantasy: "Fantasy",
    romance: "Romance",
    thriller: "Thriller",
    biography: "Biography",
    history: "History",
    science: "Science",
    "self-help": "Self-Help",
    children: "Children's",
    "young-adult": "Young Adult",
    poetry: "Poetry",
    comics: "Comics & Graphic Novels",
    other: "Other",
};

export const bookStatusLabels: Record<BookStatus, string> = {
    available: "Available",
    reserved: "Reserved",
    exchanged: "Exchanged",
};