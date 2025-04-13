"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

export function ProfileAvatar() {
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <Link href="/profile" className="block">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden relative">
                <span className="text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
            </div>
        </Link>
    );
}