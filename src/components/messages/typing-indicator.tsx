"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/lib/socket-context";
import { motion, AnimatePresence } from "framer-motion";

interface TypingIndicatorProps {
    threadId: string;
    participantName: string;
}

export function TypingIndicator({ threadId, participantName }: TypingIndicatorProps) {
    const [isTyping, setIsTyping] = useState(false);
    const { socket } = useSocket();

    useEffect(() => {
        if (socket) {
            socket.on("typing:update", (data: { threadId: string; isTyping: boolean }) => {
                if (data.threadId === threadId) {
                    setIsTyping(data.isTyping);
                }
            });

            return () => {
                socket.off("typing:update");
            };
        }
    }, [socket, threadId]);

    return (
        <AnimatePresence>
            {isTyping && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-muted-foreground px-4 h-6 flex items-center"
                >
                    {participantName} is typing
                    <span className="ml-1 flex space-x-0.5">
                        <motion.span
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            className="inline-block w-1 h-1 bg-muted-foreground rounded-full"
                        />
                        <motion.span
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="inline-block w-1 h-1 bg-muted-foreground rounded-full"
                        />
                        <motion.span
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="inline-block w-1 h-1 bg-muted-foreground rounded-full"
                        />
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}