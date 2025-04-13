"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { bookService } from "@/lib/book-service";
import { Book } from "@/types";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CardGrid } from "@/components/ui/card-grid";
import { BookCard } from "@/components/books/book-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Search } from "lucide-react";

export default function SeekerDashboardPage() {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isSeeker = useAuthStore((state) => state.isSeeker);
    const router = useRouter();
    const [recentBooks, setRecentBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !isSeeker) {
            router.push("/login");
            return;
        }

        const fetchRecentBooks = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await bookService.getBooks({
                    status: "available",
                    limit: 8,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                });
                setRecentBooks(response.books);
            } catch (err) {
                setError("Failed to load recent books. Please try again.");
                console.error("Error fetching books:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentBooks();
    }, [isAuthenticated, isSeeker, router]);

    if (!user) {
        return (
            <Container className="flex justify-center items-center">
                <LoadingSpinner size="lg" />
            </Container>
        );
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <Container>
            <PageHeader
                title={`${getGreeting()},`}
                description={user.name}
            />

            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Recently Added Books</h2>
                    <Button variant="outline" asChild>
                        <Link href="/books">
                            <Search className="mr-2 h-4 w-4" />
                            Browse All Books
                        </Link>
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : error ? (
                    <ErrorAlert message={error} />
                ) : recentBooks.length === 0 ? (
                    <EmptyState
                        type="books"
                        title="No books available"
                        description="There are no books available at the moment. Check back later!"
                        actionLabel="Refresh"
                        onAction={() => window.location.reload()}
                    />
                ) : (
                    <CardGrid
                        columns={{ default: 1, sm: 2, md: 3, lg: 4 }}
                        gap="lg"
                    >
                        {recentBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </CardGrid>
                )}
            </div>
        </Container>
    );
}
