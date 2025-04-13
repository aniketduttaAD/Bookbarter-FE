"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { NotificationCenter } from "../notifications/notification-center";
import { ProfileAvatar } from "../ui/profile-avatar";
import Image from "next/image";

interface NavItem {
    href: string;
    label: string;
    requireAuth?: boolean;
    roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" },
    { href: "/dashboard/owner", label: "Dashboard", requireAuth: true, roles: ["owner"] },
    { href: "/dashboard/seeker", label: "Dashboard", requireAuth: true, roles: ["seeker"] },
    { href: "/wishlist", label: "Wishlist", requireAuth: true, roles: ["seeker"] },
];

export function MainNav() {
    const pathname = usePathname();
    const { isAuthenticated, user, logout } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const filteredNavItems = useMemo(() => {
        return NAV_ITEMS.filter((item) => {
            if (item.requireAuth && !isAuthenticated) return false;
            if (item.roles && (!user || !item.roles.includes(user.role))) return false;
            return true;
        });
    }, [isAuthenticated, user]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <header className="bg-background border-b sticky top-0 z-40 w-full">
            <div className="w-full px-4 md:px-8 flex h-16 items-center justify-between">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center space-x-2 font-semibold text-xl">
                        <Image
                            src="/icons/icon-512x512.png"
                            alt="BookBarter Logo"
                            width={32}
                            height={32}
                        />
                        <span>BookBarter</span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center space-x-6">
                    <ul className="flex space-x-4">
                        {filteredNavItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-primary",
                                        pathname === item.href
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-center space-x-4">
                        <NotificationCenter />
                        <ThemeToggle />
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <ProfileAvatar />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={logout}
                                >
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button variant="default" size="sm" asChild>
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </nav>

                <div className="flex items-center space-x-2 md:hidden">
                    {isAuthenticated && <ProfileAvatar />}
                    <NotificationCenter />
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <nav id="mobile-menu" className="md:hidden border-t w-full px-4">
                    <ul className="flex flex-col py-4">
                        {filteredNavItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex w-full items-center py-2 px-6 text-base font-medium transition-colors hover:bg-muted",
                                        pathname === item.href
                                            ? "text-foreground bg-muted font-semibold"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                        {isAuthenticated ? (
                            <li>
                                <button
                                    onClick={logout}
                                    className="flex w-full items-center py-2 px-6 text-base font-medium text-destructive hover:bg-muted"
                                >
                                    Logout
                                </button>
                            </li>
                        ) : (
                            <>
                                <li>
                                    <Link
                                        href="/login"
                                        className="flex w-full items-center py-2 px-6 text-base font-medium transition-colors hover:bg-muted"
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/signup"
                                        className="flex w-full items-center py-2 px-6 text-base font-medium transition-colors hover:bg-muted"
                                    >
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            )}
        </header>
    );
}