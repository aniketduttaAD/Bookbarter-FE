import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function BookDetailSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            </div>
            <div className="md:col-span-2 space-y-6">
                <div>
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-16" />
                    </div>

                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
                <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-5 w-5" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-5 w-5" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </Card>
                </div>
                <Card className="p-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </Card>
                <div className="flex flex-wrap gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        </div>
    );
}