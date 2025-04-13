"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/lib/socket-context";

interface LiveViewingIndicatorProps {
    bookId: string;
    className?: string;
}

export function LiveViewingIndicator({ bookId, className }: LiveViewingIndicatorProps) {
    const [viewerCount, setViewerCount] = useState(1);
    const [viewers, setViewers] = useState<string[]>([]);
    const { socket, connected } = useSocket();

    useEffect(() => {
        if (socket && connected) {
            socket.emit("book:join", bookId);
            socket.on("book:viewers", ({ count, usernames }: { count: number, usernames: string[] }) => {
                setViewerCount(count);
                setViewers(usernames);
            });
            return () => {
                socket.emit("book:leave", bookId);
                socket.off("book:viewers");
            };
        }
    }, [socket, connected, bookId]);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div
                        className={`bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs flex items-center shadow-sm ${className}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Eye className="h-3 w-3 mr-1 text-primary" />
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={viewerCount}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {viewerCount} {viewerCount === 1 ? "person" : "people"} viewing
                            </motion.span>
                        </AnimatePresence>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                    {viewers.length > 0 ? (
                        <div>
                            <p className="font-medium mb-1">Currently viewing:</p>
                            <ul className="text-xs">
                                {viewers.map((viewer, index) => (
                                    <li key={index}>{viewer}</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>Number of people currently viewing this book</p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}