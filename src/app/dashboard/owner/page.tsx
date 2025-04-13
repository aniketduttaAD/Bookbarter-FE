"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth-store";
import { bookService } from "@/lib/book-service";
import { ratingService } from "@/lib/rating-service";
import { Book, Rating } from "@/types";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CardGrid } from "@/components/ui/card-grid";
import { BookCard } from "@/components/books/book-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { UserProfileCard } from "@/components/ui/user-profile-card";
import { StatsCard } from "@/components/ui/stats-card";
import { Plus, BookOpen, TrendingUp, Star } from "lucide-react";
import { BookGridSkeleton } from "@/components/ui/book-grid-skeleton";
import { Separator } from "@/components/ui/seperator";

export default function OwnerDashboardPage() {
    const { user, isAuthenticated, isOwner } = useAuthStore();
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !isOwner) {
            router.push("/login");
            return;
        }

        const fetchBooks = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await bookService.getBooks({ ownerId: user?.id });
                setBooks(response.books);
            } catch (err) {
                setError("Failed to load your books. Please try again.");
                console.error("Error fetching books:", err);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchRatings = async () => {
            try {
                if (user?.id) {
                    const ownerRatings = await ratingService.getOwnerRatings(user.id);
                    setRatings(ownerRatings);
                }
            } catch (err) {
                console.error("Error fetching ratings:", err);
            }
        };

        if (user?.id) {
            fetchBooks();
            fetchRatings();
        }
    }, [isAuthenticated, isOwner, router, user?.id]);

    if (!user) {
        return (
            <Container className="flex justify-center items-center h-screen">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </Container>
        );
    }

    const calculateAverageRating = () => {
        if (ratings.length === 0) return 0;
        const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        return total / ratings.length;
    };

    const stats = [
        {
            title: "Available Books",
            value: books.filter((book) => book.status === "available").length,
            icon: <BookOpen className="h-5 w-5" />,
            color: "bg-green-500/10 text-green-500",
        },
        {
            title: "Rating",
            value: ratings.length > 0 ? `${calculateAverageRating().toFixed(1)}/5` : "No ratings",
            description: `Based on ${ratings.length} ratings`,
            icon: <Star className="h-5 w-5" />,
            color: "bg-yellow-500/10 text-yellow-500",
        },
        {
            title: "Exchanges",
            value: books.filter((book) => book.status === "exchanged").length,
            icon: <TrendingUp className="h-5 w-5" />,
            color: "bg-purple-500/10 text-purple-500",
        },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <Container>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <PageHeader
                    title={`${getGreeting()},`}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild>
                        <Link href="/books/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Book
                        </Link>
                    </Button>
                </motion.div>
            </div>

            {/* Profile + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-1">
                    <UserProfileCard
                        user={user}
                        bookCount={books.length}
                        ratingAverage={calculateAverageRating()}
                        onEditClick={() => router.push("/profile")}
                    />
                </div>

                <div className="lg:col-span-3">
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.1,
                                }}
                            >
                                <StatsCard
                                    title={stat.title}
                                    value={stat.value}
                                    description={stat.description}
                                    icon={stat.icon}
                                    iconColor={stat.color}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Books Grid */}
            <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold">Your Books</h2>
                <Separator />

                {isLoading ? (
                    <BookGridSkeleton count={4} />
                ) : error ? (
                    <ErrorAlert message={error} />
                ) : books.length === 0 ? (
                    <EmptyState
                        type="books"
                        title="No books listed yet"
                        description="Start sharing books with the community by adding your first book."
                    />
                ) : (
                    <CardGrid columns={{ default: 1, sm: 2, md: 3, lg: 4 }} gap="lg">
                        {books.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </CardGrid>
                )}
            </div>
        </Container>
    );
}
