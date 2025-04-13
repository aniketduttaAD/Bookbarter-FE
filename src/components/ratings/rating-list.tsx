"use client";

import { useMemo } from "react";
import { formatDate } from "@/lib/utils";
import { Rating } from "@/types";
import { StarRating } from "@/components/ui/star-rating";
import { UserAvatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { motion } from "framer-motion";

interface RatingListProps {
    ratings: Rating[];
    className?: string;
}

export function RatingList({ ratings, className }: RatingListProps) {
    const averageRating = useMemo(() => {
        if (ratings.length === 0) return 0;
        const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        return total / ratings.length;
    }, [ratings]);

    if (ratings.length === 0) {
        return (
            <EmptyState
                type="ratings"
                title="No ratings yet"
                className={className}
            />
        );
    }

    return (
        <div className={className}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold mb-1">Ratings & Reviews</h3>
                    <p className="text-sm text-muted-foreground">
                        Based on {ratings.length} {ratings.length === 1 ? "rating" : "ratings"}
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                    <StarRating value={averageRating} readonly size="md" />
                </div>
            </div>

            <div className="space-y-4">
                {ratings.map((rating, index) => (
                    <motion.div
                        key={rating.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                                <UserAvatar name={rating.userName} size="sm" />
                                <div>
                                    <p className="font-medium">{rating.userName}</p>
                                    <div className="flex items-center space-x-2">
                                        <StarRating value={rating.rating} readonly size="sm" />
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(rating.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>

                            {rating.review && (
                                <CardContent>
                                    <p className="text-sm">{rating.review}</p>
                                </CardContent>
                            )}
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}