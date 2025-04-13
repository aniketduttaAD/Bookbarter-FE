import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Book, BookGenre, BookCondition, BookStatus } from "@/types";
import { bookService } from "@/lib/book-service";
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

interface BookFilters {
    genre?: BookGenre;
    condition?: BookCondition;
    status?: BookStatus;
    location?: string;
    search?: string;
    ownerId?: string;
}

interface SortOptions {
    sortBy: "createdAt" | "title" | "author";
    sortOrder: "asc" | "desc";
}

interface BookState {
    books: Book[];
    selectedBook: Book | null;
    filters: BookFilters;
    sortOptions: SortOptions;
    isLoading: boolean;
    error: string | null;
    total: number;
    page: number;
    limit: number;
    totalPages: number;

    fetchBooks: () => Promise<void>;
    fetchBook: (id: string) => Promise<void>;
    setSelectedBook: (book: Book | null) => void;
    setFilters: (filters: Partial<BookFilters>) => void;
    setSortOptions: (sortOptions: Partial<SortOptions>) => void;
    resetFilters: () => void;
    setPage: (page: number) => void;
}

export const useBookStore = create<BookState>()(
    persist(
        (set, get) => ({
            books: [],
            selectedBook: null,
            filters: {},
            sortOptions: {
                sortBy: "createdAt",
                sortOrder: "desc",
            },
            isLoading: false,
            error: null,
            total: 0,
            page: 1,
            limit: 12,
            totalPages: 0,

            fetchBooks: async () => {
                try {
                    set({ isLoading: true, error: null });
                    const { filters, sortOptions, page, limit } = get();

                    const response = await bookService.getBooks({
                        ...filters,
                        sortBy: sortOptions.sortBy,
                        sortOrder: sortOptions.sortOrder,
                        page,
                        limit,
                    });

                    set({
                        books: response.books,
                        total: response.total,
                        totalPages: response.totalPages,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : "Failed to fetch books"
                    });
                }
            },

            fetchBook: async (id: string) => {
                try {
                    set({ isLoading: true, error: null });
                    const book = await bookService.getBook(id);
                    set({ selectedBook: book, isLoading: false });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : "Failed to fetch book"
                    });
                }
            },

            setSelectedBook: (book) => set({ selectedBook: book }),

            setFilters: (newFilters) => {
                set((state) => ({
                    filters: { ...state.filters, ...newFilters },
                    page: 1,
                }));
            },

            setSortOptions: (newSortOptions) => {
                set((state) => ({
                    sortOptions: { ...state.sortOptions, ...newSortOptions },
                }));
            },

            resetFilters: () => {
                set({
                    filters: {},
                    page: 1,
                });
            },

            setPage: (page) => set({ page }),
        }),
        {
            name: "book-storage",
            storage: createJSONStorage(() => cookieStorage),
            partialize: (state) => ({
                filters: state.filters,
                sortOptions: state.sortOptions,
                page: state.page,
                limit: state.limit,
            }),
        }
    )
);