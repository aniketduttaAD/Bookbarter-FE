import { Container } from "@/components/layout/container";
import { BookDetail } from "@/components/books/book-detail";
import { Metadata } from "next";
import { use } from "react";

interface BookPageProps {
    params: Promise<{ id: string }>;

}

export const metadata: Metadata = {
    title: "BookBarter",
    description: "View details about this book",
};

export default function BookPage({ params }: BookPageProps) {
    const { id } = use(params);

    return (
        <Container>
            <BookDetail bookId={id} />
        </Container>
    );
}