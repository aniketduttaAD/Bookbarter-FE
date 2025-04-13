"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <Container className="flex flex-col items-center justify-center text-center py-20">
            <h1 className="text-4xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground mt-4 max-w-md">
                We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            <div className="flex gap-4 mt-8">
                <Button onClick={reset} variant="default">
                    Try again
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Go Home</Link>
                </Button>
            </div>
        </Container>
    );
}
