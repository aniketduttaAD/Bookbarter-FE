"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/auth/profile-form";
import { useAuthStore } from "@/store/auth-store";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { bookService } from "@/lib/book-service";
import { Book } from "@/types";
import { CardGrid } from "@/components/ui/card-grid";
import { BookCard } from "@/components/books/book-card";
import { EmptyState } from "@/components/ui/empty-state";
import { UserProfileCard } from "@/components/ui/user-profile-card";

export default function ProfilePage() {
    const { user, isAuthenticated, isOwner } = useAuthStore();
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("account");

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }

        if (isAuthenticated && isOwner && user?.id) {
            setIsLoading(true);
            bookService.getBooks({ ownerId: user.id })
                .then(response => {
                    setBooks(response.books);
                })
                .catch(error => {
                    console.error("Error fetching books:", error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isAuthenticated, isOwner, router, user?.id]);

    if (!user) {
        return (
            <Container className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader
                title="Your Profile"
                description="Manage your account information and preferences"
                className="mb-8"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                    className="md:col-span-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <UserProfileCard
                        user={user}
                        bookCount={books.length}
                        ratingAverage={isOwner ? 4.5 : 0}
                    />
                </motion.div>

                <motion.div
                    className="md:col-span-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="account">
                        <TabsList className="mb-4">
                            <TabsTrigger value="account">Account Details</TabsTrigger>
                            {isOwner && (
                                <TabsTrigger value="books">Your Books</TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="account">
                            <ProfileForm />
                        </TabsContent>

                        {isOwner && (
                            <TabsContent value="books">
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                                    </div>
                                ) : books.length === 0 ? (
                                    <EmptyState
                                        type="books"
                                        title="No books listed yet"
                                        description="Start sharing books with the community by adding your first book."
                                    />
                                ) : (
                                    <CardGrid
                                        columns={{ default: 1, sm: 2, md: 2 }}
                                        gap="md"
                                    >
                                        {books.map(book => (
                                            <BookCard key={book.id} book={book} />
                                        ))}
                                    </CardGrid>
                                )}
                            </TabsContent>
                        )}
                    </Tabs>
                </motion.div>
            </div>
        </Container>
    );
}