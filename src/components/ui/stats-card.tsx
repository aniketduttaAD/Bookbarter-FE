"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
    iconColor?: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    className?: string;
}

export function StatsCard({
    title,
    value,
    description,
    icon,
    iconColor = "text-primary bg-primary/10",
    trend,
    trendValue,
    className,
}: StatsCardProps) {
    const trendColors = {
        up: "text-green-600",
        down: "text-red-600",
        neutral: "text-yellow-600",
    };

    return (
        <Card className={cn("flex flex-col justify-between h-full w-full", className)}>
            <CardContent className="flex flex-col justify-between h-full p-6">
                <div className="flex justify-between items-start gap-4 flex-1">
                    <div className="flex flex-col justify-between flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h3 className="text-2xl md:text-3xl font-bold mt-1 break-words">{value}</h3>
                        </motion.div>

                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                        )}

                        {trend && trendValue && (
                            <p className={cn("text-xs mt-2 flex items-center", trendColors[trend])}>
                                {trend === "up" && "↑"}
                                {trend === "down" && "↓"}
                                {trend === "neutral" && "→"}{" "}
                                {trendValue}
                            </p>
                        )}
                    </div>

                    {icon && (
                        <div className={cn("p-2 rounded-full shrink-0", iconColor)}>
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
