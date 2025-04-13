import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <Container className="flex flex-col items-center justify-center text-center py-20">
            <h1 className="text-6xl font-bold">404</h1>
            <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
                The page you are looking for doesn&apos;t exist or has been moved.
            </p>
            <Button className="mt-8" asChild>
                <Link href="/">Go Home</Link>
            </Button>
        </Container>
    );
}