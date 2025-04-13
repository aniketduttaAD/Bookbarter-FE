import { offlineApi } from "./offline-api";
import { Notification } from "@/types";

export const notificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        const response = await offlineApi.get<Notification[]>("/notifications");
        return response;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await offlineApi.get<{ count: number }>("/notifications/unread/count");
        return response.count;
    },

    markAsRead: async (id: string): Promise<void> => {
        await offlineApi.patch(`/notifications/${id}/read`, {});
    },

    markAllAsRead: async (): Promise<void> => {
        await offlineApi.patch("/notifications/read-all", {});
    },

    deleteNotification: async (id: string): Promise<void> => {
        await offlineApi.delete(`/notifications/${id}`);
    },

    deleteAllNotifications: async (): Promise<void> => {
        await offlineApi.delete("/notifications");
    },
};
