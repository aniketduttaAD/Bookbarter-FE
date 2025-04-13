"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { BookForm } from "@/components/books/book-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useAuthStore } from "@/store/auth-store";
import { useBookStore } from "@/store/book-store";
import { CreateBookData } from "@/schemas/book-schema";
import { use } from "react";

interface EditBookPageProps {
    params: Promise<{ id: string }>;
}

export default function EditBookPage({ params }: EditBookPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { isAuthenticated, isOwner, user } = useAuthStore();
    const { selectedBook, fetchBook, isLoading, error } = useBookStore();
    const [initialData, setInitialData] = useState<Partial<CreateBookData> | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !isOwner) {
            router.push("/login");
            return;
        }

        fetchBook(id);
    }, [isAuthenticated, isOwner, id, fetchBook, router]);

    useEffect(() => {
        if (selectedBook) {
            if (user?.id !== selectedBook.ownerId) {
                router.push("/dashboard/owner");
                return;
            }

            setInitialData({
                title: selectedBook.title,
                author: selectedBook.author,
                genre: selectedBook.genre,
                description: selectedBook.description,
                condition: selectedBook.condition,
                location: selectedBook.location,
                contactPreference: selectedBook.contactPreference,
            });
        }
    }, [selectedBook, user, router]);

    if (isLoading) {
        return (
            <Container className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-12">
                <ErrorAlert message={error} />
            </Container>
        );
    }

    if (!initialData) {
        return (
            <Container className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </Container>
        );
    }

    return (
        <Container className="max-w-3xl">
            <PageHeader
                title="Edit Book"
                description="Update your book listing"
                className="mb-8"
            />
            <BookForm
                initialData={initialData}
                isEditing={true}
                bookId={id}
            />
        </Container>
    );
}