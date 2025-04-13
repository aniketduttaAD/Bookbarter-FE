"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowIndicator(true);
            toast.success("You are back online!");
            setTimeout(() => setShowIndicator(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowIndicator(true);
            toast.error("You are offline. Some features may be limited.");
        };
        setIsOnline(navigator.onLine);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!showIndicator) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 
          px-4 py-2 rounded-full shadow-lg flex items-center space-x-2
          ${isOnline ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
            >
                {isOnline ? (
                    <Wifi className="h-4 w-4" />
                ) : (
                    <WifiOff className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                    {isOnline ? "Online" : "Offline"}
                </span>
            </motion.div>
        </AnimatePresence>
    );
}