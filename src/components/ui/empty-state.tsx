import { BookX, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateType = "search" | "books" | "wishlist" | "messages" | "error" | "ratings";

interface EmptyStateProps {
    type?: EmptyStateType;
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    type = "books",
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    className,
}: EmptyStateProps) {
    const defaults: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
        search: {
            icon: <Search className="h-12 w-12 text-muted-foreground" />,
            title: "No results found",
            description: "We couldn't find any results for your search. Try adjusting your search terms.",
        },
        books: {
            icon: <BookX className="h-12 w-12 text-muted-foreground" />,
            title: "No books available",
            description: "There are no books available at the moment. Check back later or be the first to add a book!",
        },
        wishlist: {
            icon: <BookX className="h-12 w-12 text-muted-foreground" />,
            title: "Your wishlist is empty",
            description: "You haven't added any books to your wishlist yet.",
        },
        messages: {
            icon: <BookX className="h-12 w-12 text-muted-foreground" />,
            title: "No messages",
            description: "You don't have any messages yet.",
        },
        error: {
            icon: <AlertCircle className="h-12 w-12 text-destructive" />,
            title: "Something went wrong",
            description: "An error occurred. Please try again later.",
        },
        ratings: {
            icon: <BookX className="h-12 w-12 text-muted-foreground" />,
            title: "No ratings yet",
            description: "Be the first to rate this book!",
        },
    };

    const content = defaults[type];

    return (
        <div className={cn("flex flex-col items-center justify-center text-center p-8", className)}>
            {content.icon}
            <h3 className="mt-4 text-lg font-semibold">{title || content.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
                {description || content.description}
            </p>
            {(actionLabel && actionHref) && (
                <Button
                    className="mt-4"
                    asChild
                >
                    <a href={actionHref}>{actionLabel}</a>
                </Button>
            )}
            {(actionLabel && onAction) && (
                <Button
                    className="mt-4"
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
