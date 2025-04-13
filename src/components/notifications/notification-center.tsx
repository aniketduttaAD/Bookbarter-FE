"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { notificationService } from "@/lib/notification-service";
import { Notification } from "@/types";
import { useSocket } from "@/lib/socket-context";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationCenter() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const prevUnreadCountRef = useRef(0);
    const { socket } = useSocket();

    const unreadCount = notifications.filter(n => !n.read).length;
    const allCount = notifications.length;

    const filteredNotifications = activeTab === "unread"
        ? notifications.filter(n => !n.read)
        : notifications;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const fetchedNotifications = await notificationService.getNotifications();
                setNotifications(fetchedNotifications);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on("notification:new", (notification: Notification) => {
                setNotifications(prev => [notification, ...prev]);

                toast(notification.message, {
                    icon: "🔔",
                    position: "top-right",
                });
            });

            return () => {
                socket.off("notification:new");
            };
        }
    }, [socket]);

    useEffect(() => {
        if (unreadCount > prevUnreadCountRef.current && prevUnreadCountRef.current > 0) {
            toast(`You have ${unreadCount} unread notifications`, {
                icon: "🔔"
            });
        }
        prevUnreadCountRef.current = unreadCount;
    }, [unreadCount]);

    useEffect(() => {
        if (open && unreadCount > 0) {
            const markAsRead = async () => {
                try {
                    await notificationService.markAllAsRead();
                    setNotifications(prev =>
                        prev.map(notification => ({ ...notification, read: true }))
                    );
                } catch (error) {
                    console.error("Error marking notifications as read:", error);
                }
            };

            markAsRead();
        }
    }, [open, unreadCount]);

    const handleDelete = async (id: string) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(notification => notification.id !== id));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleClearAll = async () => {
        try {
            await notificationService.deleteAllNotifications();
            setNotifications([]);
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <NotificationBadge
                            count={unreadCount}
                            className="absolute -top-1 -right-1"
                        />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96 p-0" align="end">
                <Card className="border-0">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Notifications</CardTitle>
                            {allCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearAll}
                                    className="h-8 px-2 text-xs"
                                >
                                    <Trash className="h-3.5 w-3.5 mr-1" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                        <div className="px-4 py-2">
                            <TabsList className="w-full">
                                <TabsTrigger value="all" className="flex-1">
                                    All
                                    {allCount > 0 && (
                                        <span className="ml-1 text-xs bg-muted rounded-full px-1.5">
                                            {allCount}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="unread" className="flex-1">
                                    Unread
                                    {unreadCount > 0 && (
                                        <span className="ml-1 text-xs bg-primary/20 text-primary rounded-full px-1.5">
                                            {unreadCount}
                                        </span>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="all" className="m-0">
                            <NotificationList
                                notifications={filteredNotifications}
                                loading={loading}
                                onDelete={handleDelete}
                                onClick={handleNotificationClick}
                            />
                        </TabsContent>

                        <TabsContent value="unread" className="m-0">
                            <NotificationList
                                notifications={filteredNotifications}
                                loading={loading}
                                onDelete={handleDelete}
                                onClick={handleNotificationClick}
                            />
                        </TabsContent>
                    </Tabs>

                    <CardFooter className="p-2 border-t text-center text-xs text-muted-foreground">
                        Notifications are cleared after 30 days
                    </CardFooter>
                </Card>
            </PopoverContent>
        </Popover>
    );
}

interface NotificationListProps {
    notifications: Notification[];
    loading: boolean;
    onDelete: (id: string) => void;
    onClick: (notification: Notification) => void;
}

function NotificationList({
    notifications,
    loading,
    onDelete,
    onClick
}: NotificationListProps) {
    if (loading) {
        return (
            <div className="py-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="py-12 text-center">
                <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground">No notifications to display</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[350px]">
            <div className="p-2">
                <AnimatePresence initial={false}>
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.2 }}
                            layout
                        >
                            <div
                                className={`relative p-3 mb-1 rounded-md cursor-pointer transition-colors group
                  ${notification.read ? 'bg-card hover:bg-accent/50' : 'bg-accent hover:bg-accent/70'}`}
                                onClick={() => onClick(notification)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>

                                        <div className="flex items-center mt-2">
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                            {!notification.read && (
                                                <div className="ml-2 h-2 w-2 rounded-full bg-primary"></div>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(notification.id);
                                        }}
                                    >
                                        <Trash className="h-3.5 w-3.5" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ScrollArea>
    );
}
