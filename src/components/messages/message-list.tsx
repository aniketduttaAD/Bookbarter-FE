"use client";

import { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, CheckCheck } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Message } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
    const { user } = useAuthStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    if (isLoading) {
        return (
            <div className="h-[400px] flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center text-center p-4">
                <p className="text-muted-foreground mb-2">No messages yet</p>
                <p className="text-xs text-muted-foreground">
                    Send a message to start the conversation
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[400px] px-4">
            <div className="space-y-4 py-4">
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <MessageItem
                            key={message.id}
                            message={message}
                            isOwn={message.senderId === user?.id}
                        />
                    ))}
                </AnimatePresence>
            </div>
            <div ref={messagesEndRef} />
        </ScrollArea>
    );
}

interface MessageItemProps {
    message: Message;
    isOwn: boolean;
}

function MessageItem({ message, isOwn }: MessageItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
        >
            <div className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} max-w-[80%] gap-2`}>
                {!isOwn && (
                    <UserAvatar name={message.senderName} size="sm" />
                )}

                <div>
                    <div
                        className={`rounded-lg p-3 flex flex-col space-y-1 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                    >
                        <p className="text-sm">{message.content}</p>
                    </div>

                    <div
                        className={`flex mt-1 text-xs text-muted-foreground ${isOwn ? "justify-end" : "justify-start"
                            }`}
                    >
                        <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>

                        {isOwn && (
                            <div className="flex items-center ml-1">
                                {message.read ? (
                                    <CheckCheck className="h-3 w-3 text-primary" />
                                ) : (
                                    <Check className="h-3 w-3" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
