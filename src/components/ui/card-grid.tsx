import { cn } from "@/lib/utils";

interface CardGridProps {
    children: React.ReactNode;
    columns?: {
        default: number;
        sm?: number;
        md?: number;
        lg?: number;
    };
    gap?: "sm" | "md" | "lg";
    className?: string;
}

export function CardGrid({
    children,
    columns = { default: 1, sm: 2, md: 3, lg: 4 },
    gap = "md",
    className,
}: CardGridProps) {
    return (
        <div
            className={cn(
                "grid",
                {
                    "grid-cols-1": columns.default === 1,
                    "grid-cols-2": columns.default === 2,
                    "grid-cols-3": columns.default === 3,
                    "grid-cols-4": columns.default === 4,
                    "sm:grid-cols-1": columns.sm === 1,
                    "sm:grid-cols-2": columns.sm === 2,
                    "sm:grid-cols-3": columns.sm === 3,
                    "sm:grid-cols-4": columns.sm === 4,
                    "md:grid-cols-1": columns.md === 1,
                    "md:grid-cols-2": columns.md === 2,
                    "md:grid-cols-3": columns.md === 3,
                    "md:grid-cols-4": columns.md === 4,
                    "lg:grid-cols-1": columns.lg === 1,
                    "lg:grid-cols-2": columns.lg === 2,
                    "lg:grid-cols-3": columns.lg === 3,
                    "lg:grid-cols-4": columns.lg === 4,
                    "gap-2": gap === "sm",
                    "gap-4": gap === "md",
                    "gap-6": gap === "lg",
                },
                className
            )}
        >
            {children}
        </div>
    );
}