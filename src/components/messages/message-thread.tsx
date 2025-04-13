"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/avatar";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { TypingIndicator } from "./typing-indicator";
import { MessageThread, Message } from "@/types";
import { messageService } from "@/lib/message-service";
import { useSocket } from "@/lib/socket-context";
import { useAuthStore } from "@/store/auth-store";
import { motion } from "framer-motion";
import Link from "next/link";

interface MessageThreadComponentProps {
    thread: MessageThread;
    onBack?: () => void;
}

export function MessageThreadComponent({ thread, onBack }: MessageThreadComponentProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const { user } = useAuthStore();

    const otherParticipant = thread.participants.find(p => p.id !== user?.id);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const fetchedMessages = await messageService.getMessages(thread.id);
                setMessages(fetchedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [thread.id]);

    useEffect(() => {
        if (socket) {
            socket.emit("thread:join", thread.id);

            const handleNewMessage = (message: Message) => {
                if (message.threadId === thread.id) {
                    setMessages(prev => [...prev, message]);
                    if (message.senderId !== user?.id) {
                        messageService.markMessageAsRead(message.id).catch(console.error);
                    }
                }
            };

            const handleReadReceipt = (messageId: string) => {
                setMessages(prev =>
                    prev.map(m => (m.id === messageId ? { ...m, read: true } : m))
                );
            };

            socket.on("message:new", handleNewMessage);
            socket.on("message:read", handleReadReceipt);

            return () => {
                socket.emit("thread:leave", thread.id);
                socket.off("message:new", handleNewMessage);
                socket.off("message:read", handleReadReceipt);
            };
        }
    }, [socket, thread.id, user?.id]);

    useEffect(() => {
        const markThreadAsRead = async () => {
            try {
                await messageService.markThreadAsRead(thread.id);
                setMessages(prev =>
                    prev.map(m => (m.senderId !== user?.id ? { ...m, read: true } : m))
                );
            } catch (error) {
                console.error("Error marking thread as read:", error);
            }
        };

        if (!loading && user) {
            markThreadAsRead();
        }
    }, [loading, thread.id, user]);

    const handleSendMessage = async (content: string) => {
        try {
            const newMessage = await messageService.sendMessage(thread.id, content);
            setMessages(prevMessages => [...prevMessages, newMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full overflow-hidden"
        >
            <CardHeader className="px-4 py-3 flex flex-row items-center gap-3 border-b sticky top-0 z-10 bg-background">
                {onBack && (
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                )}

                {otherParticipant ? (
                    <>
                        <UserAvatar name={otherParticipant.name} size="sm" />
                        <div className="flex-1 truncate">
                            <CardTitle className="text-base truncate">
                                {otherParticipant.name}
                            </CardTitle>
                        </div>
                    </>
                ) : (
                    <CardTitle className="text-base">Conversation</CardTitle>
                )}

                {thread.book && (
                    <Link href={`/books/${thread.book.id}`} className="ml-auto">
                        <Button variant="ghost" size="sm" className="gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span className="truncate max-w-[100px]">{thread.book.title}</span>
                        </Button>
                    </Link>
                )}
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto px-4">
                <MessageList messages={messages} isLoading={loading} />
            </CardContent>

            <TypingIndicator
                threadId={thread.id}
                participantName={otherParticipant?.name || "Someone"}
            />

            <CardFooter className="p-0 border-t sticky bottom-0 bg-background z-10">
                <MessageInput
                    threadId={thread.id}
                    onSend={handleSendMessage}
                    disabled={loading}
                />
            </CardFooter>
        </motion.div>
    );
}
