"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/lib/socket-context";
import { cn } from "@/lib/utils";

interface MessageInputProps {
    threadId: string;
    onSend: (content: string) => Promise<void>;
    disabled?: boolean;
}

export function MessageInput({ threadId, onSend, disabled = false }: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { socket } = useSocket();

    useEffect(() => {
        let typingTimeout: NodeJS.Timeout;

        if (socket && message.length > 0 && !isTyping) {
            setIsTyping(true);
            socket.emit("typing:start", { threadId });

            typingTimeout = setTimeout(() => {
                setIsTyping(false);
                socket.emit("typing:stop", { threadId });
            }, 2000);
        } else if (socket && message.length === 0 && isTyping) {
            setIsTyping(false);
            socket.emit("typing:stop", { threadId });
        }

        return () => {
            clearTimeout(typingTimeout);
            if (socket && isTyping) {
                socket.emit("typing:stop", { threadId });
            }
        };
    }, [message, isTyping, socket, threadId]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            textareaRef.current.focus();
        }
    }, [message]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim() || disabled || submitting) return;

        try {
            setSubmitting(true);
            await onSend(message);
            setMessage("");
            if (socket && isTyping) {
                setIsTyping(false);
                socket.emit("typing:stop", { threadId });
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t bg-background px-4 py-3 sm:px-6 w-full">
            <div className="flex w-full items-end gap-3">
                <div className="relative flex-grow w-full">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="resize-none w-full min-h-[40px] max-h-[120px] py-2 pr-10"
                        disabled={disabled || submitting}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />

                    {message.length > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                            onClick={() => setMessage("")}
                            disabled={disabled || submitting}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Clear</span>
                        </Button>
                    )}
                </div>

                <Button
                    type="submit"
                    size="icon"
                    disabled={message.trim().length === 0 || disabled || submitting}
                    className="shrink-0 transition"
                >
                    <Send className={cn("h-4 w-4", submitting && "animate-pulse")} />
                    <span className="sr-only">Send</span>
                </Button>
            </div>
        </form>
    );
}