import { offlineApi } from "./offline-api";
import { Message, MessageThread } from "@/types";

export const messageService = {
    getThreads: async (): Promise<MessageThread[]> => {
        const response = await offlineApi.get<MessageThread[]>("/messages/threads");
        return response;
    },

    getThread: async (threadId: string): Promise<MessageThread> => {
        const response = await offlineApi.get<MessageThread>(`/messages/threads/${threadId}`);
        return response;
    },

    getMessages: async (threadId: string): Promise<Message[]> => {
        const response = await offlineApi.get<Message[]>(`/messages/threads/${threadId}/messages`);
        return response;
    },

    sendMessage: async (threadId: string, content: string): Promise<Message> => {
        const response = await offlineApi.post<Message>(`/messages/threads/${threadId}/messages`, { content });
        return response;
    },

    createThread: async (recipientId: string, bookId?: string): Promise<MessageThread> => {
        const response = await offlineApi.post<MessageThread>("/messages/threads", {
            recipientId,
            bookId,
        });
        return response;
    },

    getOrCreateThreadForBook: async (recipientId: string, bookId: string): Promise<MessageThread> => {
        const response = await offlineApi.post<MessageThread>("/messages/threads/book", {
            recipientId,
            bookId,
        });
        return response;
    },

    markMessageAsRead: async (messageId: string): Promise<void> => {
        await offlineApi.patch(`/messages/${messageId}/read`, {});
    },

    markThreadAsRead: async (threadId: string): Promise<void> => {
        await offlineApi.patch(`/messages/threads/${threadId}/read`, {});
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await offlineApi.get<{ count: number }>("/messages/unread/count");
        return response.count;
    },
};
