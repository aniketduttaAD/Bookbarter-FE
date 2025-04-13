"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth-store";

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
}

export const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const { isAuthenticated, token, user } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && token) {
            const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001", {
                auth: { token },
                transports: ["websocket", "polling"],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            socketInstance.on("connect", () => {
                setConnected(true);
                if (user?.id) {
                    socketInstance.emit("join:user", user.id);
                }
            });

            socketInstance.on("disconnect", () => {
                setConnected(false);
            });

            socketInstance.on("error", (error) => {
                console.error("Socket error:", error);
            });

            socketInstance.on("reconnect_attempt", () => {
            });

            socketInstance.on("reconnect_failed", () => {
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        }

        return () => {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
        };
    }, [isAuthenticated, token, user?.id]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
}
