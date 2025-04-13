"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { X, Download, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (pathname !== "/") return;

        const isIOSDevice =
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
        setIsIOS(isIOSDevice);

        const isAppInstalled = window.matchMedia("(display-mode: standalone)").matches;

        if (!isAppInstalled) {
            const handleBeforeInstallPrompt = (e: Event) => {
                e.preventDefault();
                setDeferredPrompt(e as BeforeInstallPromptEvent);
                setShowPrompt(true);
            };

            window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

            if (isIOSDevice) {
                const timer = setTimeout(() => {
                    setShowPrompt(true);
                }, 5000);

                return () => clearTimeout(timer);
            }

            return () => {
                window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            };
        }
    }, [pathname]);

    const handleInstallClick = async () => {
        if (!deferredPrompt && !isIOS) return;

        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === "accepted") {
                console.log("User accepted the install prompt");
            } else {
                console.log("User dismissed the install prompt");
            }
            setDeferredPrompt(null);
        }

        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-4 md:w-96"
        >
            <Card>
                <CardHeader className="relative pb-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={handleDismiss}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                    <div className="flex items-center space-x-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Install App</CardTitle>
                    </div>
                    <CardDescription>
                        Install our app for a better experience
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm">
                        {isIOS ? (
                            <div>
                                <p>To install this app on your iOS device:</p>
                                <ol className="list-decimal pl-5 mt-2 space-y-1">
                                    <li>Tap the Share button</li>
                                    <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                                    <li>Tap &quot;Add&quot; in the upper right corner</li>
                                </ol>
                            </div>
                        ) : (
                            <p>
                                Install the BookBarter app on your device for quick access
                                and an improved experience, even when offline.
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    {!isIOS ? (
                        <Button onClick={handleInstallClick} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Install Now
                        </Button>
                    ) : (
                        <Button variant="secondary" onClick={handleDismiss} className="w-full">
                            Got it
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}
