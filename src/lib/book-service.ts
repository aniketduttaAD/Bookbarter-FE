import { offlineApi } from "./offline-api";
import { Book, BookStatus } from "@/types";
import { CreateBookData, UpdateBookData } from "@/schemas/book-schema";
import { AxiosResponse } from "axios";

interface GetBooksParams {
    genre?: string;
    condition?: string;
    status?: string;
    location?: string;
    search?: string;
    ownerId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

interface GetBooksResponse {
    books: Book[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const bookService = {
    getBooks: async (params: GetBooksParams = {}): Promise<GetBooksResponse> => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                queryParams.append(key, value.toString());
            }
        });

        const response = await offlineApi.get<GetBooksResponse>(`/books?${queryParams}`);
        return response;
    },

    getBook: async (id: string): Promise<Book> => {
        const response = await offlineApi.get<Book>(`/books/${id}`);
        return response;
    },

    createBook: async (data: CreateBookData, imageFile?: File): Promise<Book> => {
        if (imageFile) {
            const formData = new FormData();
            formData.append("bookData", JSON.stringify(data));
            formData.append("image", imageFile);

            const response = await offlineApi.post<AxiosResponse<Book>>("/books", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        }

        const response = await offlineApi.post<AxiosResponse<Book>>("/books", data);
        return response.data;
    },

    updateBook: async (id: string, data: UpdateBookData, imageFile?: File): Promise<Book> => {
        if (imageFile) {
            const formData = new FormData();
            formData.append("bookData", JSON.stringify(data));
            formData.append("image", imageFile);

            const response = await offlineApi.patch<AxiosResponse<Book>>(`/books/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        }

        const response = await offlineApi.patch<AxiosResponse<Book>>(`/books/${id}`, data);
        return response.data;
    },

    deleteBook: async (id: string): Promise<void> => {
        await offlineApi.delete(`/books/${id}`);
    },

    updateBookStatus: async (id: string, status: BookStatus): Promise<Book> => {
        const response = await offlineApi.patch<AxiosResponse<Book>>(`/books/${id}/status`, { status });
        return response.data;
    },
};
