"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    size?: "sm" | "md" | "lg";
    readonly?: boolean;
    className?: string;
}

export function StarRating({
    value,
    onChange,
    size = "md",
    readonly = false,
    className,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };

    const handleMouseEnter = (rating: number) => {
        if (readonly) return;
        setHoverRating(rating);
    };

    const handleMouseLeave = () => {
        if (readonly) return;
        setHoverRating(0);
    };

    const handleClick = (rating: number) => {
        if (readonly || !onChange) return;
        onChange(rating);
    };

    return (
        <div className={cn("flex", className)}>
            {[1, 2, 3, 4, 5].map((rating) => (
                <motion.span
                    key={rating}
                    className={cn(
                        "cursor-default inline-flex",
                        !readonly && "cursor-pointer",
                    )}
                    onMouseEnter={() => handleMouseEnter(rating)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(rating)}
                    whileHover={!readonly ? { scale: 1.2 } : {}}
                    whileTap={!readonly ? { scale: 0.9 } : {}}
                >
                    <Star
                        className={cn(
                            sizes[size],
                            (rating <= (hoverRating || value)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground"
                            ),
                            "transition-colors"
                        )}
                    />
                </motion.span>
            ))}
        </div>
    );
}                                                                                                                                                                                                                                                                                                                                                                   