"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ThreadList } from "@/components/messages/thread-list";
import { MessageThreadComponent } from "@/components/messages/message-thread";
import { messageService } from "@/lib/message-service";
import { MessageThread } from "@/types";
import { useSocket } from "@/lib/socket-context";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";

export default function MessagesPage() {
    const { isAuthenticated } = useAuthStore();
    const [threads, setThreads] = useState<MessageThread[]>([]);
    const [loadingThreads, setLoadingThreads] = useState(true);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const { socket } = useSocket();
    useEffect(() => {
        const checkViewport = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        checkViewport();
        window.addEventListener("resize", checkViewport);
        return () => window.removeEventListener("resize", checkViewport);
    }, []);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                setLoadingThreads(true);
                const fetchedThreads = await messageService.getThreads();
                setThreads(fetchedThreads);
                if (fetchedThreads.length > 0 && !isMobileView && !selectedThreadId) {
                    setSelectedThreadId(fetchedThreads[0].id);
                    setSelectedThread(fetchedThreads[0]);
                }
            } catch (error) {
                console.error("Error fetching threads:", error);
            } finally {
                setLoadingThreads(false);
            }
        };

        if (isAuthenticated) {
            fetchThreads();
        }
    }, [isAuthenticated, isMobileView, selectedThreadId]);

    useEffect(() => {
        if (socket) {
            socket.on("thread:new", (thread: MessageThread) => {
                setThreads(prev => [thread, ...prev]);
            });

            socket.on("thread:update", (updatedThread: MessageThread) => {
                setThreads(prev =>
                    prev.map(thread =>
                        thread.id === updatedThread.id ? updatedThread : thread
                    )
                );

                if (selectedThreadId === updatedThread.id) {
                    setSelectedThread(updatedThread);
                }
            });

            return () => {
                socket.off("thread:new");
                socket.off("thread:update");
            };
        }
    }, [socket, selectedThreadId]);

    const handleSelectThread = async (threadId: string) => {
        setSelectedThreadId(threadId);
        try {
            const thread = await messageService.getThread(threadId);
            setSelectedThread(thread);
            setThreads(prev =>
                prev.map(t =>
                    t.id === threadId ? { ...t, unreadCount: 0 } : t
                )
            );
        } catch (error) {
            console.error("Error fetching thread:", error);
        }
    };

    const handleBackToList = () => {
        setSelectedThreadId(null);
        setSelectedThread(null);
    };

    return (
        <Container>
            <PageHeader
                title="Messages"
                description="Your conversations with book owners and seekers"
                className="mb-6"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
                {(!isMobileView || !selectedThreadId) && (
                    <div className="md:col-span-1">
                        <Card className="h-full">
                            <CardContent className="p-0 h-full">
                                <ThreadList
                                    threads={threads}
                                    selectedThreadId={selectedThreadId || undefined}
                                    onSelectThread={handleSelectThread}
                                    isLoading={loadingThreads}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {selectedThreadId && selectedThread ? (
                    <div className={`${isMobileView ? "col-span-1" : "md:col-span-2"}`}>
                        <MessageThreadComponent
                            thread={selectedThread}
                            onBack={isMobileView ? handleBackToList : undefined}
                        />
                    </div>
                ) : (
                    !isMobileView && (
                        <div className="hidden md:block md:col-span-2">
                            <Card className="h-full flex items-center justify-center">
                                <EmptyState
                                    type="messages"
                                    title="Select a conversation"
                                    description="Choose a conversation from the list to start messaging"
                                />
                            </Card>
                        </div>
                    )
                )}
            </div>
        </Container>
    );
}
