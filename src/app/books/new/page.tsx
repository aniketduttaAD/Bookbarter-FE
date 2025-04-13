"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { BookForm } from "@/components/books/book-form";
import { useAuthStore } from "@/store/auth-store";

export default function NewBookPage() {
    const router = useRouter();
    const { isAuthenticated, isOwner } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated || !isOwner) {
            router.push("/login");
        }
    }, [isAuthenticated, isOwner, router]);

    return (
        <Container className="max-w-3xl mt-10">
            <PageHeader
                title="Add New Book"
                description="Share a book with the community"
                className="mb-8"
            />
            <BookForm />
        </Container>
    );
}
