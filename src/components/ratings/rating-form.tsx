"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { ratingService } from "@/lib/rating-service";
import { ratingSchema } from "@/schemas/rating-schema";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth-store";

interface RatingFormProps {
    bookId: string;
    ownerId: string;
    onRatingSubmit: () => void;
}

export function RatingForm({
    bookId,
    ownerId,
    onRatingSubmit,
}: RatingFormProps) {
    const [rating, setRating] = useState<number>(0);
    const [review, setReview] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isAuthenticated, isSeeker } = useAuthStore();
    console.log(isAuthenticated, isSeeker);

    const handleRatingChange = (value: number) => {
        setRating(value);
    };

    const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReview(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = { bookId, ownerId, rating, review };
            ratingSchema.parse(data);
            if (rating === 0) {
                toast.error("Please select a star rating");
                return;
            }
            setIsSubmitting(true);
            await ratingService.createRating(data);
            onRatingSubmit();
            setRating(0);
            setReview("");

            toast.success("Your rating has been submitted!");
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((err) => err.message).join(", ");
                toast.error(errorMessages);
            } else {
                console.error("Error submitting rating:", error);
                toast.error("Failed to submit rating. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated && !isSeeker) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className='text-xl'>Rate This Book</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className='space-y-4'>
                        <div className='flex flex-col space-y-2'>
                            <label className='text-sm font-medium'>Your Rating</label>
                            <StarRating
                                value={rating}
                                onChange={handleRatingChange}
                                size='lg'
                            />
                        </div>

                        <div className='flex flex-col space-y-2'>
                            <label htmlFor='review' className='text-sm font-medium'>
                                Your Review (Optional)
                            </label>
                            <Textarea
                                id='review'
                                placeholder='Share your thoughts about this book...'
                                value={review}
                                onChange={handleReviewChange}
                                rows={4}
                                disabled={isSubmitting}
                            />
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button type='submit' disabled={isSubmitting || rating === 0}>
                            {isSubmitting ? "Submitting..." : "Submit Rating"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    );
}
