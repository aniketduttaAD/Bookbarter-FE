"use client";

import { useEffect } from "react";
import { BookCard } from "./book-card";
import { CardGrid } from "@/components/ui/card-grid";
import { useBookStore } from "@/store/book-store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Pagination } from "@/components/ui/pagination";

export function BookGrid() {
    const {
        books,
        isLoading,
        error,
        fetchBooks,
        total,
        page,
        limit,
        totalPages,
        setPage,
    } = useBookStore();

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks, page]);

    if (isLoading && books.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return <ErrorAlert message={error} />;
    }

    if (books.length === 0) {
        return (
            <EmptyState
                type="books"
                title="No books found"
                description="Try adjusting your filters or adding a new book."
            />
        );
    }

    const start = (page - 1) * limit + 1;
    const end = Math.min(start + books.length - 1, total);

    return (
        <div>
            <div className="text-sm text-muted-foreground mb-2 text-right">
                Showing {start}–{end} of {total} books
            </div>

            <CardGrid
                columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
                gap="lg"
                className="mb-8"
            >
                {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                ))}
            </CardGrid>

            {totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}
