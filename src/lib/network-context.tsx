"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { offlineApi, initOfflineStorage } from "./offline-api";

interface NetworkContextType {
    isOnline: boolean;
    isInitialized: boolean;
    isConnectionFast: boolean;
    isStorageInitialized: boolean;
    lastOnlineTime: Date | null;
    syncOfflineActions: () => Promise<void>;
}

export const NetworkContext = createContext<NetworkContextType>({
    isOnline: true,
    isInitialized: false,
    isConnectionFast: true,
    isStorageInitialized: false,
    lastOnlineTime: null,
    syncOfflineActions: async () => { },
});

export const useNetwork = () => useContext(NetworkContext);
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function NetworkProvider({ children }: { children: ReactNode }) {
    const [isOnline, setIsOnline] = useState(
        typeof window !== "undefined" ? window.navigator.onLine : true
    );
    const [isInitialized, setIsInitialized] = useState(false);
    const [isConnectionFast, setIsConnectionFast] = useState(true);
    const [isStorageInitialized, setIsStorageInitialized] = useState(false);
    const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(
        isOnline ? new Date() : null
    );

    const syncOfflineActions = useCallback(async () => {
        if (isOnline && isStorageInitialized) {
            await offlineApi.sync();
        }
    }, [isOnline, isStorageInitialized]);

    useEffect(() => {
        initOfflineStorage()
            .then(() => setIsStorageInitialized(true))
            .catch(() => { });

        const handleOnline = () => {
            setIsOnline(true);
            setLastOnlineTime(new Date());
            syncOfflineActions().catch(() => { });
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        const checkConnectionSpeed = async () => {
            try {
                const start = Date.now();
                await fetch(`${BASE_URL}/offline/ping`, { method: "HEAD" });
                const duration = Date.now() - start;
                setIsConnectionFast(duration < 300);
            } catch {
                setIsConnectionFast(false);
            }
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        const speedCheckInterval = setInterval(checkConnectionSpeed, 30000);

        checkConnectionSpeed();
        setIsInitialized(true);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            clearInterval(speedCheckInterval);
        };
    }, [syncOfflineActions]);

    return (
        <NetworkContext.Provider
            value={{
                isOnline,
                isInitialized,
                isConnectionFast,
                isStorageInitialized,
                lastOnlineTime,
                syncOfflineActions,
            }}
        >
            {children}
        </NetworkContext.Provider>
    );
}
