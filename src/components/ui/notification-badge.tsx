"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationBadgeProps {
    count: number;
    max?: number;
    className?: string;
    pulse?: boolean;
}

export function NotificationBadge({
    count,
    max = 99,
    className,
    pulse = true,
}: NotificationBadgeProps) {
    if (count <= 0) return null;

    const displayCount = count > max ? `${max}+` : count.toString();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={cn(
                    "inline-flex items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground min-w-[1.25rem] h-5 px-1",
                    pulse && "animate-pulse-subtle",
                    className
                )}
            >
                {displayCount}
            </motion.div>
        </AnimatePresence>
    );
}