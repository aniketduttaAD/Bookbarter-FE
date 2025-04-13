import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BookGridSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    count?: number;
}

export function BookGridSkeleton({
    count = 4,
    className,
    ...props
}: BookGridSkeletonProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full",
                className
            )}
            {...props}
        >
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="flex flex-col space-y-3 bg-card rounded-lg border shadow-sm p-3 h-full"
                >
                    <div className="relative pt-[140%] w-full bg-muted rounded">
                        <Skeleton className="absolute inset-0 h-full w-full rounded" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <div className="flex items-center space-x-1 mt-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-4 rounded-full" />
                        ))}
                        <Skeleton className="h-3 w-8 ml-2" />
                    </div>
                </div>
            ))}
        </div>
    );
}