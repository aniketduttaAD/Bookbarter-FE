"use client";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { BookSearch } from "@/components/books/book-search";
import { BookFilters } from "@/components/books/book-filters";
import { BookSort } from "@/components/books/book-sort";
import { BookGrid } from "@/components/books/book-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Plus } from "lucide-react";

export default function BooksPage() {
    const { isOwner, isAuthenticated } = useAuthStore();

    return (
        <Container>
            <div className="flex justify-between items-center mb-6">
                <PageHeader
                    title="Browse Books"
                    description="Discover books available for exchange"
                />

                {isAuthenticated && isOwner && (
                    <Button size="sm" asChild>
                        <Link href="/books/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Book
                        </Link>
                    </Button>
                )}
            </div>

            <BookSearch />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <BookFilters />
                <BookSort />
            </div>

            <BookGrid />
        </Container>
    );
}
