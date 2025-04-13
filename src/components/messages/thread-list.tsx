"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/ui/avatar";
import { MessageThread } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { motion, AnimatePresence } from "framer-motion";

interface ThreadListProps {
    threads: MessageThread[];
    selectedThreadId?: string;
    onSelectThread: (threadId: string) => void;
    isLoading?: boolean;
}

export function ThreadList({
    threads,
    selectedThreadId,
    onSelectThread,
    isLoading = false,
}: ThreadListProps) {
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");

    // Filter threads based on search term
    const filteredThreads = searchTerm
        ? threads.filter(thread => {
            const otherParticipant = thread.participants.find(p => p.id !== user?.id);
            return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());
        })
        : threads;

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        name="Search Conversation"
                        placeholder="Search conversations..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredThreads.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                    <p className="text-sm font-medium">No conversations yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Messages with book owners or seekers will appear here
                    </p>
                </div>
            ) : (
                <ScrollArea className="flex-1">
                    <AnimatePresence initial={false}>
                        {filteredThreads.map((thread) => {
                            const otherParticipant = thread.participants.find(p => p.id !== user?.id);
                            const lastMessage = thread.lastMessage;

                            return (
                                <motion.div
                                    key={thread.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    layout
                                >
                                    <div
                                        className={`p-3 cursor-pointer transition-colors hover:bg-accent ${selectedThreadId === thread.id ? "bg-accent" : ""
                                            }`}
                                        onClick={() => onSelectThread(thread.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <UserAvatar name={otherParticipant?.name || ""} size="sm" />

                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <span className="font-medium truncate">
                                                        {otherParticipant?.name || "Unknown"}
                                                    </span>
                                                    {lastMessage && (
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                            {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                                        {lastMessage ? (
                                                            lastMessage.senderId === user?.id ? (
                                                                <>You: {lastMessage.content}</>
                                                            ) : (
                                                                lastMessage.content
                                                            )
                                                        ) : (
                                                            "No messages yet"
                                                        )}
                                                    </p>

                                                    {thread.unreadCount > 0 && (
                                                        <NotificationBadge count={thread.unreadCount} />
                                                    )}
                                                </div>

                                                {thread.book && (
                                                    <p className="text-xs text-primary mt-1 truncate">
                                                        Re: {thread.book.title}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </ScrollArea>
            )}
        </div>
    );
}